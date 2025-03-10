import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";
import { Logger } from "../Logger/Logger.js";
import { IMessage as IMessage } from "./IMessage.js";
import { type Change, CompareObjects } from "./CompareObjects.js"
import { type Status } from "../shared/X1Messages.js"
import { LogLevel } from "../shared/LogLevel.js";
import { AmsStatus2Main, AmsStatus2String, AmsStatus2Sub } from "../shared/AmsTypes.js";
import { BambuFtpClient, BambuFtpOptions } from "./BambuFtpClient.js";
import { Job } from "../JobManager/JobManager.js";

export class X1Options
{
  Logger?  : Logger;
  Host     : string = "localhost";
  Port     : number = 8883;
  Serial   : string = "no-serial";
  UserName : string = "bblp";
  Password : string = "";
  FtpOptions : BambuFtpOptions = new BambuFtpOptions;
}

export const X1ClientEvent = Object.freeze (
{
  Status:           "status",
  LedCtrl:          "led-ctrl",
  PropertyChanged:  "property-changed",
  ConnectionStatus: "connection-status",
  LogLevelChanged:  "log-level-changed",
  ProjectLoaded:    "x1client-project-loaded"
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
  Parser : (message : IMessage, client : X1Client) => void;
}

interface ILogMessageDefinition
{
  Pattern  : string;
  LogLevel : LogLevel;
}

export class X1Client extends EventEmitter
{
  public IsConnected : boolean = false;
  public status : any = undefined;

  public LogLevel : LogLevel = LogLevel.Information;

  private _options : X1Options = new X1Options;
  private _client : MqttClient | null = null;
  private _firstConnect = true;
  private _firstClose = true;

  private _ftpClient : BambuFtpClient;

  public constructor(options : Partial<X1Options>)
  {
    super();
    Object.assign(this._options, options);

    this._ftpClient = new BambuFtpClient(this._options);
  }
  
  public async LoadProject(job : Job)
  {
    const project = await this._ftpClient.DownloadProject(`${job.name}.gcode.3mf`);
    this.emit(X1ClientEvent.ProjectLoaded, project, job);
  }

  public async connect()
  {
    while (this.IsConnected === false)
    try
    {
      if (this._firstConnect === true)
      {
        this._options.Logger?.Log(`[X1Client] Connecting to ${this._options.Host}:${this._options.Port}...`);
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
          this._options.Logger?.Log (`[X1Client] ${err}`);
        }
      }
    }
  }

  public close()
  {
    this._client?.end();
  }

  private onConnect(client : X1Client)
  {
    client._options.Logger?.Log(`[X1Client] OnConnect: Connected to printer at ${client._options.Host}:${client._options.Port}.`);
    client.IsConnected = true;
    this._firstConnect = true;
    this._firstClose = true;
    client.emit(X1ClientEvent.ConnectionStatus, this.IsConnected);
    client.emit(X1ClientEvent.LogLevelChanged, client.LogLevel);
    client._client?.subscribe(`device/${client._options.Serial}/report`, async (err) =>
    {
      if (err)
      {
        client._options.Logger?.Log(`[X1Client] OnConnect: Unable to subscribe, (${err})`);
        return;
      }

      // TODO: DEBUG - Get some project files from the printer via FTPS:
      // await this._ftpClient.DownloadProject("Girl-Leg-Right.gcode.3mf");
      // await this._ftpClient.DownloadProject("Dino (T-rex) All plates_plate_8.gcode.3mf");
      // await this._ftpClient.DownloadProject("Xmas_Tree_v1-rims.gcode.3mf");
        

      //let msg = {"info": {"sequence_id": "0", "command": "get_version"}};
      //this._client?.publish(`device/${this._options.Serial}/request`, JSON.stringify(msg));
    });
  }
  private onClose(client : X1Client)
  {
    client.IsConnected = false;
    if (client._firstClose === true)
    {
      client._options.Logger?.Log(`[X1Client] OnClose: Disconnected from printer. Trying to re-connect to ${this._options.Host}:${this._options.Port}...`);
      client._firstClose = false;
    }
    client.emit(X1ClientEvent.ConnectionStatus, client.IsConnected);
  } 

  public SetLogLevel(level : LogLevel)
  {
    this._options.Logger?.Log(`[X1Client] SetLogLevel: Changing log level to ${level}...`);
    this.LogLevel = level;
    this.emit(X1ClientEvent.LogLevelChanged, this.LogLevel);
  }

  private parsers =
  [
    {
      Section : "print", Commands : 
      [
        {Command : "push_status",               Parser : this.parsePushStatus },
        // {Command : "ams_change_filament",       Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "ams_control",               Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "ams_filament_setting",      Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "ams_user_setting",          Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "calibration",               Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "clean_print_error",         Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali",            Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali_del",        Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali_get",        Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali_get_result", Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali_sel",        Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "extrusion_cali_set",        Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "flowrate_cali",             Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "flowrate_get_result",       Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "gcode_file",                Parser : (message : IMessage, client : X1Client) => {}  },
        {Command : "gcode_line",                Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "pause",                     Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "print_option",              Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "print_speed",               Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "push_status",               Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "resume",                    Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "set_ctt",                   Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "stop",                      Parser : (message : IMessage, client : X1Client) => {}  },
        // {Command : "unload_filament",           Parser : (message : IMessage, client : X1Client) => {}  }
      ]
    },
    {
      Section : "system", Commands : 
      [
        {Command : "get_access_code",           Parser : (message : IMessage, client : X1Client) => {}  },
        {Command : "ledctrl",                   Parser : (message : IMessage, client : X1Client) => { client.emit (X1ClientEvent.LedCtrl, message); }        },
        //{Command : "set_accessories",           Parser : (message : IMessage, client : X1Client) => {} }
      ]
    },
    // {
    //   Section : "info", Commands : 
    //   [
    //     {Command : "get_version",               Parser : (message : IMessage, client : X1Client) => {}  }
    //   ]
    // },
    // {
    //   Section : "pushing", Commands : 
    //   [
    //     {Command : "pushall",                   Parser : (message : IMessage, client : X1Client) => {}  }
    //   ]
    // },
    // {
    //   Section : "upgrade", Commands : 
    //   [
    //     {Command : "upgrade_confirm",           Parser : (message : IMessage, client : X1Client) => {}  },
    //     {Command : "consistency_confirm",       Parser : (message : IMessage, client : X1Client) => {}  },
    //     {Command : "start",                     Parser : (message : IMessage, client : X1Client) => {}  }
    //   ]
    // },
    // {
    //   Section : "camera", Commands : 
    //   [
    //     {Command : "ipcam_record_set",          Parser : (message : IMessage, client : X1Client) => {}  },
    //     {Command :"ipcam_timelapse",            Parser : (message : IMessage, client : X1Client) => {}  },
    //     {Command :"ipcam_resolution_set",       Parser : (message : IMessage, client : X1Client) => {}  }
    //   ]
    // },
    // {
    //   Section : "xcam", Commands : 
    //   [
    //     {Command : "xcam_control_set",          Parser : (message : IMessage, client : X1Client) => {}  }
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

  private parsePushStatus(message : IMessage, client : X1Client)
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
          client.emit (X1ClientEvent.PropertyChanged, change);
        }
      });
    }

    client.status = newStatus;
    client.emit (X1ClientEvent.Status, client.status); 
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
