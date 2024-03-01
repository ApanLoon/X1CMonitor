import { MqttClient, connectAsync } from "mqtt";
import { EventEmitter } from "node:events";

export class X1Options
{
  Host     : string = "localhost";
  Port     : number = 8883;
  Serial   : string = "no-serial";
  UserName : string = "bblp";
  Password : string = "";
}

export const X1ClientEvent = Object.freeze (
{
  Print:     "print"
});

export class X1Client extends EventEmitter
{
  public IsConnected : boolean = false;
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
      console.log(`X1Client: Connecting to ${this._options.Host}:${this._options.Port}...`);
      this._client = await connectAsync(`mqtts://${this._options.Host}:${this._options.Port}`, 
      {
        username: this._options.UserName,
        password: this._options.Password,
        rejectUnauthorized: false,
        reconnectPeriod: 1000
      });

      console.log("X1Client: Connected.");
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
      console.log ("X1Client: ", err);
    }
  }

  public close()
  {
    this._client?.end();
  }

  private onConnect()
  {
    console.log("X1Client.OnConnect: Connected to printer.");
    this.IsConnected = true;
    this._client?.subscribe(`device/${this._options.Serial}/report`, (err) =>
    {
      if (err)
      {
        console.log(err);
        return;
      }

      //let msg = {"info": {"sequence_id": "0", "command": "get_version"}};
      //this._client?.publish(`device/${this._options.Serial}/request`, JSON.stringify(msg));
    });
  }
  private onDisconnect()
  {
    this.IsConnected = false;
    console.log("X1Client: Closed");
  } 

  private parseMessage(data : any)
  {
    if (data.print !== undefined)
    {
      this.emit (X1ClientEvent.Print, data.print);
      //this.parsePrint(data.print);
    }
    else
    {
      console.log(data);
    }
  }

  // private parsePrint(print : any)
  // {
  //   if (print.ams !== undefined)
  //   {
  //     this.parseAms(print.ams);
  //   }
  // }

  // private parseAms(ams : any)
  // {
  // }
}

