import { WebSocket } from "ws";
import { randomUUID } from "crypto";

export class Connection
{
    public id : string = randomUUID();
    public socket : WebSocket;

    constructor(socket : WebSocket,
                messageParser: { (data:  string): void; },
                closeHandler : { (event: any, connection : Connection) : void }
               )
    {
        this.socket = socket;
        socket.on("message", messageParser);
        socket.on("close", event => closeHandler(event, this));
    }
}

export class ConnectionCollection
{
    connections : Array<Connection> = [];

    add (connection : Connection)
    {
        let c = this.connections.find(x=>x.id === connection.id);
        if (c)
        {
            return;
        }
        this.connections.push (connection);
    }

    remove(connection : Connection)
    {
        this.connections.filter((value, index, arr) =>
        {
            if (value.id === connection.id)
            {
                arr.splice(index, 1);
            }
        });
    }

    sendToAll(msg : string)
    {
        this.connections.forEach(connection =>
        {
            if (connection.socket === undefined || connection.socket === null) // TODO:  || connection.socket.closed === true)
            {
                return;
            }
            connection.socket.send(msg);
        });
    }
}
