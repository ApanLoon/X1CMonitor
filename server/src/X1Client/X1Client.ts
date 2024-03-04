import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";
import { Logger } from "../Logger/Logger.js";
import { IMessage as IMessage } from "./IMessage.js";

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
  Status:            "print",
  ConnectionStatus: "connection-status"
});

export class X1Client extends EventEmitter
{
  public IsConnected : boolean = false;
  public status : any;

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
        reconnectPeriod: 1000
      });

      this._options.Logger?.Log("[X1Client] Connected.");
      this._client.on("connect", this.onConnect);
      this._client.on("close", this.onDisconnect);
      this.onConnect();
      
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

  private onConnect()
  {
    this._options.Logger?.Log("[X1Client] OnConnect: Connected to printer.");
    this.IsConnected = true;
    this.emit(X1ClientEvent.ConnectionStatus, this.IsConnected);
    this._client?.subscribe(`device/${this._options.Serial}/report`, (err) =>
    {
      if (err)
      {
        this._options.Logger?.Log(`[X1Client] OnConnect: Unable to subscribe, (${err})`);
        return;
      }

      //let msg = {"info": {"sequence_id": "0", "command": "get_version"}};
      //this._client?.publish(`device/${this._options.Serial}/request`, JSON.stringify(msg));
    });
  }
  private onDisconnect()
  {
    this.IsConnected = false;
    this._options.Logger?.Log("[X1Client] Closed");
    this.emit(X1ClientEvent.ConnectionStatus, this.IsConnected);
  } 

  private parseMessage(data : any)
  {
    let message = data.print as IMessage;

    if (data.print !== undefined)
    {
      switch (message.command)
      {
        case "push_status":
          this.status = message;
          this.emit (X1ClientEvent.Status, message);
          break;
        // case "ams_change_filament":
        //   break;
        // case "ams_control":
        //   break;
        // case "ams_filament_setting":
        //   break;
        // case "ams_user_setting":
        //   break;
        // case "calibration":
        //   break;
        // case "clean_print_error":
        //   break;
        // case "extrusion_cali":
        //   break;
        // case "extrusion_cali_del":
        //   break;
        // case "extrusion_cali_get":
        //   break;
        // case "extrusion_cali_get_result":
        //   break;
        // case "extrusion_cali_sel":
        //   break;
        // case "extrusion_cali_set":
        //   break;
        // case "flowrate_cali":
        //   break;
        // case "flowrate_get_result":
        //   break;
        // case "gcode_file":
        //   break;
        // case "gcode_line":
        //   break;
        // case "pause":
        //   break;
        // case "print_option":
        //   break;
        // case "print_speed":
        //   break;
        // case "push_status":
        //   break;
        // case "resume":
        //   break;
        // case "set_ctt":
        //   break;
        // case "stop":
        //   break;
        // case "unload_filament":
        //   break;

        default:
          console.log ("Unparsed print message:\n", data);
      }
    }
/*
    else if (data.system !== undefined)
    {
      switch (message.command)
      {
        case "get_access_code":
          break;
        case "ledctrl":
          break;
        case "set_accessories":
          break;

          default:
            console.log ("Unparsed system message:\n", data);
      }
    }

    else if (data.info !== undefined)
    {
      switch (message.command)
      {
        case "get_version":
          break;

          default:
            console.log ("Unparsed info message:\n", data);
      }
    }

    else if (data.pushing !== undefined)
    {
      switch (message.command)
      {
        case "pushall":
          break;

          default:
            console.log ("Unparsed pushing message:\n", data);
      }
    }

    else if (data.upgrade !== undefined)
    {
      switch (message.command)
      {
        case "upgrade_confirm":
          break;
        case "consistency_confirm":
          break;
        case "start":
            break;
        default:
          console.log ("Unparsed upgrade message:\n", data);
      }
    }

    else if (data.camera !== undefined)
    {
      switch (message.command)
      {
        case "ipcam_record_set":
          break;
        case "ipcam_timelapse":
          break;
        case "ipcam_resolution_set":
            break;
        default:
          console.log ("Unparsed camera message:\n", data);
      }
    }

    else if (data.xcam !== undefined)
    {
      switch (message.command)
      {
        case "xcam_control_set":
          break;

          default:
            console.log ("Unparsed xcam message:\n", data);
      }
    }
*/
    else
    {
      console.log ("Unknown message:\n", data);
    }
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
    "^status\.wifi_signal$"
  ];
}
