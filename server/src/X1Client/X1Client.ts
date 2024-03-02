import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";
import { Logger } from "../Logger/Logger.js";

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
  Print:            "print",
  ConnectionStatus: "connection-status"
});

export class X1Client extends EventEmitter
{
  public IsConnected : boolean = false;
  public Print : any;

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
    if (data.print !== undefined)
    {
      this.Print = data.print;
      this.emit (X1ClientEvent.Print, data.print);
    }
    else
    {
      console.log(data);
    }
  }

  public LogIgnore_print =
  [
    "print\.ams\.version",
    "print\.ams\.ams\[[0-9]+\]\.humidity",
    "print\.ams\.ams\[[0-9]+\]\.temp",
    "print\.bed_temper",
    "print\.chamber_temper",
    "print\.gcode_file_prepare_percent",
    "print\.layer_num",
    "print\.mc_percent",
    "print\.mc_remaining_time",    
    "print\.nozzle_temper",
    "print\.queue_est",
    "print\.user_id",
    "print\.wifi_signal"
  ];
}
