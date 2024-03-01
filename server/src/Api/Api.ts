import { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { Connection, ConnectionCollection } from "./ConnectionCollection.js";

export class ApiOptions
{
    public Port : number = 4000;
}

export const ApiEvent = Object.freeze (
{
    SetLight:     "setlight"
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

        this.server.on("connection", socket =>
        {
            let connection = new Connection(socket, (data : string) =>
            {
                const msg = JSON.parse(data);
                switch (msg.type)
                {
                    case "SetLight":     this.emit(ApiEvent.SetLight, msg.isOn);             break;
                }
            },
            (_event: any, connection: Connection) =>
            {
                console.log ("Api: Client disconnected.", connection.id);
                this.connections.remove(connection);
            });

            console.log("Api: Client connected", connection.id);

            this.connections.add(connection);
        });
    }

    sendPrint (print : any )
    {
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Print",
            print: print
        }));
    }
}
