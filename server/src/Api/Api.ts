import { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { Connection, ConnectionCollection, ConnectionEvent } from "./ConnectionCollection.js";
import { Logger } from "../Logger/Logger.js";
import { LogLevel } from "../shared/LogLevel.js";
import { Job } from "../shared/Job.js";
import { BambuMonitorClientMessage, BambuMonitorServerMessage } from "../shared/BambuMonitorApi.js";

export class ApiOptions
{
    public Logger? : Logger;
    public Port : number = 4000;
}

export const ApiEvent = Object.freeze (
{
    GetState:           "getstate",
    SetLight:           "setlight",
    GetPrinterLogLevel: "getprinterloglevel",
    SetPrinterLogLevel: "setprinterloglevel",
    RequestFullLog:     "requestfulllog",
    RequestJobHistory:  "requestjobHistory"
});
    

export class Api extends EventEmitter
{
    private options : ApiOptions = new ApiOptions;
    private connections : ConnectionCollection = new ConnectionCollection;
    private server : WebSocketServer;

    public constructor(options : Partial<ApiOptions>)
    {
        super();

        Object.assign(this.options, options);

        this.server = new WebSocketServer({ port: this.options.Port });
        this.options.Logger?.Log (`[Api] Listening on port ${this.options.Port}.`);

        this.server.on("connection", socket =>
        {
            let connection = new Connection(socket, (data : string) =>
            {
                const msg = JSON.parse(data);
                switch (msg.Type)
                {
                    case BambuMonitorServerMessage.GetState:           this.emit(ApiEvent.GetState);                       break;
                    case BambuMonitorServerMessage.SetLight:           this.emit(ApiEvent.SetLight, msg.isOn);             break;
                    case BambuMonitorServerMessage.GetPrinterLogLevel: this.emit(ApiEvent.GetPrinterLogLevel);             break;
                    case BambuMonitorServerMessage.SetPrinterLogLevel: this.emit(ApiEvent.SetPrinterLogLevel, msg.Level);  break;
                    case BambuMonitorServerMessage.RequestFullLog:     this.emit(ApiEvent.RequestFullLog);                 break;
                    case BambuMonitorServerMessage.RequestJobHistory:  this.emit(ApiEvent.RequestJobHistory);              break;
                }
            },
            (_event: any, connection: Connection) =>
            {
                //this.options.Logger?.Log (`[Api] Client disconnected. (${connection.id})`);
                this.connections.remove(connection);
            });

            //this.options.Logger?.Log(`[Api] Client connected. (${connection.id})`);
            connection.on(ConnectionEvent.LostHeartbeat, ()=>
            {
                console.log("Lost Heartbeat: api");
                this.connections.remove (connection);
            });

            this.connections.add(connection);
        });
    }

    sendStatus (status : any )
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.Status,
            Status: status
        }));
    }

    sendPrinterConnectionStatus(isConnected : boolean)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.PrinterConnectionStatus,
            IsConnected: isConnected
        }));
    }

    sendPrinterLogLevel(level : LogLevel)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.PrinterLogLevel,
            Level: level
        }));
    }

    sendLogMessage(message : string)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.MessageLogged,
            Message: message
        }));    
    }

    sendCurrentJob (job : Job | null)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.CurrentJob,
            Job: job
        }));                
    }
    
    sendJobHistory (jobs : Array<Job> | null)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            Type: BambuMonitorClientMessage.JobHistory,
            Jobs: jobs ?? []
        }));                
    }
}
