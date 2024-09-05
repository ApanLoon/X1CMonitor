import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";
import { Logger } from "../Logger/Logger.js";
import { IMessage as IMessage } from "./IMessage.js";
import { type Change, CompareObjects } from "./CompareObjects.js"
import { type Status } from "../../../shared/src/X1Messages.js"

export class X1Options
{
  Logger?  : Logger;
  Host     : string = "localhost";
  Port     : number = 8883;
  Serial   : string = "no-serial";
  UserName : string = "bblp";
  Password : string = "";
}

export const X1ClientEvent = Object.freeze (
{
  Status:           "status",
  LedCtrl:          "led-ctrl",
  PropertyChanged:  "property-changed",
  ConnectionStatus: "connection-status"
});

interface ICommandParser
{
  Command : string;
  Parser : (message : IMessage, client : X1Client) => void;
}

export class X1Client extends EventEmitter
{
  public IsConnected : boolean = false;
  public status : any = undefined;

  private _options : X1Options = new X1Options;
  private _client : MqttClient | null = null;
 
  public constructor(options : Partial<X1Options>)
  {
    super();
    Object.assign(this._options, options);
  }
  
  public async connect()
  {
    while (this.IsConnected === false)
    try
    {
      this._options.Logger?.Log(`[X1Client] Connecting to ${this._options.Host}:${this._options.Port}...`);
      this._client = await connectAsync(`mqtts://${this._options.Host}:${this._options.Port}`, 
      {
        username: this._options.UserName,
        password: this._options.Password,
        rejectUnauthorized: false,
        keepalive: 10,
        reconnectPeriod: 1000
      });

      this._options.Logger?.Log("[X1Client] Connected.");
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
      this._options.Logger?.Log (`[X1Client] ${err}`);
    }
  }

  public close()
  {
    this._client?.end();
  }

  private onConnect(client : X1Client)
  {
    client._options.Logger?.Log("[X1Client] OnConnect: Connected to printer.");
    client.IsConnected = true;
    client.emit(X1ClientEvent.ConnectionStatus, this.IsConnected);
    client._client?.subscribe(`device/${client._options.Serial}/report`, (err) =>
    {
      if (err)
      {
        client._options.Logger?.Log(`[X1Client] OnConnect: Unable to subscribe, (${err})`);
        return;
      }

      //let msg = {"info": {"sequence_id": "0", "command": "get_version"}};
      //this._client?.publish(`device/${this._options.Serial}/request`, JSON.stringify(msg));
    });
  }
  private onClose(client : X1Client)
  {
    client.IsConnected = false;
    client._options.Logger?.Log(`[X1Client] OnClose: Disconnected from printer. Trying to re-connect to ${this._options.Host}:${this._options.Port}...`);
    client.emit(X1ClientEvent.ConnectionStatus, client.IsConnected);
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

        let skip = client.LogIgnore_status?.some(regexp => change.path.match(regexp)) || false;
        if (skip === false)
        {
          client.emit (X1ClientEvent.PropertyChanged, change);
        }
      });
    }

    client.status = newStatus;
    client.emit (X1ClientEvent.Status, client.status); 
  }

  public LogIgnore_status =
  [
    "^status\.ams\.version$",
    "^status\.ams\.ams\[[0-9]+\]\.humidity$",
    "^status\.ams\.ams\[[0-9]+\]\.temp$",
    "^status\.ams\.ams\[[0-9]+\]\.tray\[[0-9]+\]\.remain$",
    "^status\.bed_temper$",
    "^status\.big_fan1_speed$",
    "^status\.big_fan2_speed$",
    "^status\.chamber_temper$",
    "^status\.cooling_fan_speed$",
    "^status\.fan_gear$",
    "^status\.print_gcode_action$",
    "^status\.gcode_file_prepare_percent$",
    "^status\.heatbreak_fan_speed$",
    "^status\.home_flag$",
    "^status\.layer_num$",
    "^status\.mc_percent$",
    "^status\.mc_remaining_time$",
    "^status\.net\.conf$",
    "^status\.nozzle_temper$",
    "^status\.param$",
    "^status\.queue_est$",
    "^status\.subtask_id$",
    "^status\.user_id$",
    "^status\.wifi_signal$",
    "^status\.device\.nozzle\.[0-9]+\.temp$",
    "^status\.device\.nozzle\.info$",
    "^status\.device\.fan$"
  ];
}
