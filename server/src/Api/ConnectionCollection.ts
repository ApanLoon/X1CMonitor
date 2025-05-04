import { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { EventEmitter } from "node:events";

export const ConnectionEvent = Object.freeze (
{
    LostHeartbeat:           "lostHeartbeat"
});

export class Connection extends EventEmitter
{
    public id : string = randomUUID();
    public socket : WebSocket;

    private heartBeatInterval = 10000;
    private keepAlive : NodeJS.Timeout | null = null;

    constructor(socket : WebSocket,
                messageParser: { (data:  string): void; },
                closeHandler : { (event: any, connection : Connection) : void }
               )
    {
        super();
        this.socket = socket;
        let self = this;
        socket.on("message", ( message : string ) => {self.bumpKeepAlive(); messageParser(message)});
        socket.on("close", event => closeHandler(event, this));

        this.bumpKeepAlive();
    }

    public Close()
    {
        this.socket.close();
    }

    private bumpKeepAlive()
    {
        if (this.keepAlive != null) clearTimeout (this.keepAlive);
        let self = this;
        this.keepAlive = setTimeout(() => self.emit(ConnectionEvent.LostHeartbeat), self.heartBeatInterval);
    }
}

export class ConnectionCollection
{
    connections : Array<Connection> = [];

    count()
    {
        return this.connections.length;
    }
    
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
        connection.Close();

        this.connections.filter((value, index, arr) =>
        {
            if (value.id === connection.id)
            {
                arr.splice(index, 1);
            }
        });
    }

    removeAll()
    {
        this.connections.forEach(connection => { connection.Close(); });
        this.connections = [];
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

    sendBinaryToAll(data : any)
    {
        this.connections.forEach(connection =>
        {
            if (connection.socket === undefined || connection.socket === null) // TODO:  || connection.socket.closed === true)
            {
                return;
            }
            connection.socket.send(data, { binary: true });
        });
    }
}
