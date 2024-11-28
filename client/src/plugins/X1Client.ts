
import { ref, type Ref } from "vue";
import { type IX1Client, LogLevel } from "./IX1Client";
import { Status } from "../../../server/src/shared/X1Messages";

export class X1ClientOptions
{
    public Host : string = "localhost";
    public Port : number = 4000;
}

export class X1Client implements IX1Client
{
    Options: X1ClientOptions;
    IsConnected: Ref<boolean> = ref(false);
    IsPrinterConnected : Ref<boolean> = ref(false);
    Status: Ref<Status> = ref(new Status);
    LogLevel: Ref<LogLevel> = ref(LogLevel.Information);
    Log: Ref<string[]> = ref([]);

    private _socket? : WebSocket;

    constructor(options : X1ClientOptions)
    {
        this.Options = options;
    }

    public Connect(connectHandler? : () => void) : void
    {
        console.log(`[X1Client] Connecting to ${this.Options.Host}:${this.Options.Port}...`);

        this._socket = new WebSocket(`ws://${this.Options.Host}:${this.Options.Port}`);

        this._socket.addEventListener("open", () => 
        {
            console.log(`[X1Client] Connected to ${this.Options.Host}:${this.Options.Port}`);
            this.IsConnected.value = true;
            if (connectHandler)
            {
                connectHandler();
            }
        });
        
        this._socket.addEventListener("message", (event) => 
        {
            const msg = JSON.parse(event.data);
        
            switch (msg.Type)
            {
                case "Status":                  this.Status.value             = msg.Status as Status;      break;
                case "PrinterConnectionStatus": this.IsPrinterConnected.value = msg.IsConnected;           break;
                case "PrinterLogLevel":         this.LogLevel.value           = msg.Level as LogLevel;     break;
                case "MessageLogged":           this.Log.value.push (msg.Message);                         break;
            }
        });

        this._socket.onclose = error =>
        {
            console.log("[X1Client] Connection closed.", error);
            this.IsConnected.value = false;
            setTimeout(()=>this.Connect(connectHandler), 1000);
        }
    }

    GetState(): void
    {
        this._socket?.send(JSON.stringify(
        {
            Type: "GetState"
        }));
    }

    SetPrinterLogLevel(level : LogLevel)
    {
        this._socket?.send(JSON.stringify(
        {
            Type: "SetPrinterLogLevel",
            Level: level
        }));
    }

    RequestFullLog()
    {
        this.Log.value = [];
        this._socket?.send(JSON.stringify(
        {
            Type: "RequestFullLog"
        }));
    }
}
