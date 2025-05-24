import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";
import { Logger } from "../Logger/Logger.js";
import { IMessage as IMessage } from "./IMessage.js";
import { CompareObjects } from "./CompareObjects.js"
import { type Status } from "../shared/BambuMessages.js"
import { LogLevel } from "../shared/LogLevel.js";
import { AmsStatus2String, AmsTrayBrandFamily, AmsTrayBrandFamilyId, AmsTrayBrandId, AmsTrayIsBbl, AmsTrayUuid } from "../shared/BambuAmsTypes.js";
import { BambuFtpClient, BambuFtpOptions } from "./BambuFtpClient.js";
import { Job } from "../shared/Job.js";
import { CameraFeed } from "../RtspProxy/CameraFeed.js";

export class BambuClientOptions
{
  Logger?        : Logger;
  Host           : string = "localhost";
  Port           : number = 8883;
  Serial         : string = "no-serial";
  UserName       : string = "bblp";
  Password       : string = "";
  FtpOptions     : BambuFtpOptions = new BambuFtpOptions;
  CameraFeedPort : number = 9999;
}

export const BambuClientEvent = Object.freeze (
{
  Status:           "status",
  LedCtrl:          "led-ctrl",
  PropertyChanged:  "property-changed",
  ConnectionStatus: "connection-status",
  LogLevelChanged:  "log-level-changed",
  ProjectLoaded:    "bambuclient-project-loaded"
});

class SocketError
{
  errno: number = 0;
  code: string = "";
  syscall: string = "";
  address: string = "";
  port: number = 0;
}

interface ICommandParser
{
  Command : string;
  Parser : (message : IMessage, client : BambuClient) => void;
}

interface ILogMessageDefinition
{
  Pattern  : string;
  LogLevel : LogLevel;
}

export class BambuClient extends EventEmitter
{
  public IsConnected : boolean = false;
  public status : any = undefined;
  
  public LogLevel : LogLevel = LogLevel.Information;

  private _options : BambuClientOptions = new BambuClientOptions;
  private _client : MqttClient | null = null;
  private _firstConnect = true;
  private _firstClose = true;

  private _ftpClient : BambuFtpClient;

  private _cameraFeed : CameraFeed | undefined;
  
  public constructor(options : Partial<BambuClientOptions>)
  {
    super();
    Object.assign(this._options, options);

    this._ftpClient = new BambuFtpClient(this._options);
    this._cameraFeed = new CameraFeed({ BambuClient: this, Port: this._options.CameraFeedPort, UserName: this._options.UserName, Password: this._options.Password }); // TODO: Should this even be in the BambuClient? The RtspProxy should probably be in BambuClient/ but the camera feed might be its own thing.
  }
  
  private Pad(n : number) : string
  {
    return ("0" + n).slice(-2);
  }
  
  private DateToPrefix(date : Date) : string
  {
    return `${date.getFullYear()}${this.Pad(date.getMonth() + 1)}${this.Pad(date.getDate())}-${this.Pad(date.getUTCHours())}${this.Pad(date.getUTCMinutes())}${this.Pad(date.getUTCSeconds())}`;
  }

  public async LoadProject(job : Job)
  {
    const project = await this._ftpClient.DownloadProject(`${job.Name}.gcode.3mf`, this.DateToPrefix(job.StartTime));

    // Add in extra information from AMS:
    project?.Filaments.forEach(filament => 
    {
      const trayIndex = filament.TrayId - 1;
      filament.IsBBL         = AmsTrayIsBbl         (this.status.ams, trayIndex);
      filament.BrandFamily   = AmsTrayBrandFamily   (this.status.ams, trayIndex);
      filament.BrandFamilyId = AmsTrayBrandFamilyId (this.status.ams, trayIndex);
      filament.BrandId       = AmsTrayBrandId       (this.status.ams, trayIndex);
      filament.Uuid          = AmsTrayUuid          (this.status.ams, trayIndex);
    });

    this.emit(BambuClientEvent.ProjectLoaded, project, job);
  }

  public async connect()
  {
    while (this.IsConnected === false)
    try
    {
      if (this._firstConnect === true)
      {
        this._options.Logger?.Log(`[BambuClient] Connecting to ${this._options.Host}:${this._options.Port}...`);
        this._firstConnect = false;
      }
      this._client = await connectAsync(`mqtts://${this._options.Host}:${this._options.Port}`, 
      {
        username: this._options.UserName,
        password: this._options.Password,
        rejectUnauthorized: false,
        keepalive: 10,
        reconnectPeriod: 1000
      });

      this._client.on("connect", ()=>this.onConnect(this));
      this._client.on("close", ()=>this.onClose(this));
      this.onConnect(this);
      
      this._client.on("message", (topic, message) =>
      {
        // message is Buffer
        let text = message.toString();
        this.parseMessage(JSON.parse(text));
      });
    }
    catch (err)
    {
      if (err instanceof SocketError)
      {
        const error = err as SocketError;
        if (error.code !== "ETIMEOUT")
        {
          this._options.Logger?.Log (`[BambuClient] ${err}`);
        }
      }
    }
  }

  public close()
  {
    this._cameraFeed?.Stop();
    this._client?.end();
  }

  private onConnect(client : BambuClient)
  {
    client._options.Logger?.Log(`[BambuClient] OnConnect: Connected to printer at ${client._options.Host}:${client._options.Port}.`);
    client.IsConnected = true;
    this._firstConnect = true;
    this._firstClose = true;
    client.emit(BambuClientEvent.ConnectionStatus, this.IsConnected);
    client.emit(BambuClientEvent.LogLevelChanged, client.LogLevel);
    client._client?.subscribe(`device/${client._options.Serial}/report`, async (err) =>
    {
      if (err)
      {
        client._options.Logger?.Log(`[BambuClient] OnConnect: Unable to subscribe, (${err})`);
        return;
      }

      // Request version info:
      //let msg = {"info": {"sequence_id": "0", "command": "get_version"}};
      //this._client?.publish(`device/${this._options.Serial}/request`, JSON.stringify(msg));     
    });
  }
  private onClose(client : BambuClient)
  {
    client.IsConnected = false;
    if (client._firstClose === true)
    {
      client._options.Logger?.Log(`[BambuClient] OnClose: Disconnected from printer. Trying to re-connect to ${this._options.Host}:${this._options.Port}...`);
      client._firstClose = false;
    }
    client.emit(BambuClientEvent.ConnectionStatus, client.IsConnected);
  } 

  public SetLogLevel(level : LogLevel)
  {
    this._options.Logger?.Log(`[BambuClient] SetLogLevel: Changing log level to ${level}...`);
    this.LogLevel = level;
    this.emit(BambuClientEvent.LogLevelChanged, this.LogLevel);
  }

  private parsers =
  [
    {
      Section : "print", Commands : 
      [
        {Command : "push_status",               Parser : this.parsePushStatus },
        // {Command : "ams_change_filament",       Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "ams_control",               Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "ams_filament_setting",      Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "ams_user_setting",          Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "calibration",               Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "clean_print_error",         Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali",            Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali_del",        Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali_get",        Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali_get_result", Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali_sel",        Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "extrusion_cali_set",        Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "flowrate_cali",             Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "flowrate_get_result",       Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "gcode_file",                Parser : (message : IMessage, client : BambuClient) => {}  },
        {Command : "gcode_line",                Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "pause",                     Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "print_option",              Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "print_speed",               Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "push_status",               Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "resume",                    Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "set_ctt",                   Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "stop",                      Parser : (message : IMessage, client : BambuClient) => {}  },
        // {Command : "unload_filament",           Parser : (message : IMessage, client : BambuClient) => {}  }
      ]
    },
    {
      Section : "system", Commands : 
      [
        {Command : "get_access_code",           Parser : (message : IMessage, client : BambuClient) => {}  },
        {Command : "ledctrl",                   Parser : (message : IMessage, client : BambuClient) => { client.emit (BambuClientEvent.LedCtrl, message); }        },
        //{Command : "set_accessories",           Parser : (message : IMessage, client : BambuClient) => {} }
      ]
    },
    // {
    //   Section : "info", Commands : 
    //   [
    //     {Command : "get_version",               Parser : (message : IMessage, client : BambuClient) => {}  }
    //   ]
    // },
    // {
    //   Section : "pushing", Commands : 
    //   [
    //     {Command : "pushall",                   Parser : (message : IMessage, client : BambuClient) => {}  }
    //   ]
    // },
    // {
    //   Section : "upgrade", Commands : 
    //   [
    //     {Command : "upgrade_confirm",           Parser : (message : IMessage, client : BambuClient) => {}  },
    //     {Command : "consistency_confirm",       Parser : (message : IMessage, client : BambuClient) => {}  },
    //     {Command : "start",                     Parser : (message : IMessage, client : BambuClient) => {}  }
    //   ]
    // },
    // {
    //   Section : "camera", Commands : 
    //   [
    //     {Command : "ipcam_record_set",          Parser : (message : IMessage, client : BambuClient) => {}  },
    //     {Command :"ipcam_timelapse",            Parser : (message : IMessage, client : BambuClient) => {}  },
    //     {Command :"ipcam_resolution_set",       Parser : (message : IMessage, client : BambuClient) => {}  }
    //   ]
    // },
    // {
    //   Section : "xcam", Commands : 
    //   [
    //     {Command : "xcam_control_set",          Parser : (message : IMessage, client : BambuClient) => {}  }
    //   ]
    // }
  ];

  private parseMessage(data : any)
  {

    this.parsers.forEach(section =>
    {
      let message = data[section.Section] as IMessage;

      if (Object.hasOwn(data, section.Section))
      {
        let parser = section.Commands.find((x : ICommandParser) => x.Command === message.command)?.Parser;

        if (parser !== undefined)
        {
          parser(message, this);
        }
        else
        {
          console.log (`Unknown command: ${section.Section}.${message.command}: `, message);
        }
      }
    });
  }

  private parsePushStatus(message : IMessage, client : BambuClient)
  {
    let ignoreChanges = false;
    if (client.status === undefined)
    {
      client.status = {};
      ignoreChanges = true;
    }

    let newStatus = message as Status;
    // Properties that has been removed in FW can be manually copied over here:
    newStatus.gcode_start_time = client.status.gcode_start_time;

    const l = CompareObjects(client.status, message, "status");
    if (ignoreChanges === false)
    {
      l.forEach(change => 
      {
        // Since the gcode_start_time was removed in FW 01.08.00.00, we re-create it here to enable completion estimates in the frontend:
        if (change.path === "status.gcode_state" && change.newValue === "RUNNING")
        {
          newStatus.gcode_start_time = String(Date.now() / 1000);
        }

        if (change.path === "status.ams_status")
        {
          change.oldValue = AmsStatus2String(change.oldValue);
          change.newValue = AmsStatus2String(change.newValue);
            // change.oldValue = JSON.stringify({ Main : AmsStatus2Main (change.oldValue), Sub : AmsStatus2Sub (change.oldValue)});
            // change.newValue = JSON.stringify({ Main : AmsStatus2Main (change.newValue), Sub : AmsStatus2Sub (change.newValue)});
        }

        let level : LogLevel = LogLevel.Debug;
        const definition = client.PrintStatus_LogMessageDefinitions.find(d => change.path.match(d.Pattern));
        if (definition !== undefined)
        {
          level = definition.LogLevel;
        }

        if (client.LogLevel >= level)
        {
          client.emit (BambuClientEvent.PropertyChanged, change);
        }
      });
    }

    client.status = newStatus;
    client.emit (BambuClientEvent.Status, client.status); 
  }

  private PrintStatus_LogMessageDefinitions : ILogMessageDefinition[] =
  [
    { Pattern: "^status\.gcode_state$",                                LogLevel: LogLevel.Information } as ILogMessageDefinition,
    { Pattern: "^status\.gcode_file$",                                 LogLevel: LogLevel.Information } as ILogMessageDefinition,
    { Pattern: "^status\.subtask_name$",                               LogLevel: LogLevel.Information } as ILogMessageDefinition,

    { Pattern: "^status\.ipcam.timelapse$",                            LogLevel: LogLevel.Information } as ILogMessageDefinition,

    { Pattern: "^status\.ams\.tray_now$",                              LogLevel: LogLevel.Information } as ILogMessageDefinition,

    { Pattern: "^status\.ams\.version$",                               LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.ams\.ams\[[0-9]+\]\.humidity$",               LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.ams\.ams\[[0-9]+\]\.temp$",                   LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.ams\.ams\[[0-9]+\]\.tray\[[0-9]+\]\.remain$", LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.bed_temper$",                                 LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.big_fan1_speed$",                             LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.big_fan2_speed$",                             LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.chamber_temper$",                             LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.cooling_fan_speed$",                          LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.fan_gear$",                                   LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.print_gcode_action$",                         LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.gcode_file_prepare_percent$",                 LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.heatbreak_fan_speed$",                        LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.home_flag$",                                  LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.layer_num$",                                  LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.mc_percent$",                                 LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.mc_remaining_time$",                          LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.net\.conf$",                                  LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.nozzle_temper$",                              LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.param$",                                      LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.queue_est$",                                  LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.subtask_id$",                                 LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.user_id$",                                    LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.wifi_signal$",                                LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.device\.nozzle\.[0-9]+\.temp$",               LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.device\.nozzle\.info$",                       LogLevel: LogLevel.Trace } as ILogMessageDefinition,
    { Pattern: "^status\.device\.fan$",                                LogLevel: LogLevel.Trace } as ILogMessageDefinition
  ];
}
