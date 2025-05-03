import WebSocket, { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { Connection, ConnectionCollection, ConnectionEvent } from "../Api/ConnectionCollection.js";

export class WebSocketPipe extends EventEmitter
{
    private _server : WebSocketServer | undefined;
    private _connections : ConnectionCollection = new ConnectionCollection;

    private static readonly STREAM_MAGIC_BYTES = "jsmp" // Must be 4 bytes

    private _port   : number = -1;
    private _width  : number = 0;
    private _height : number = 0;

    constructor (port : number)
    {
        super();

        this._port = port;
    }

    public Start(width : number, height : number)
    {
        this._width = width;
        this._height = height;

        this._server = new WebSocketServer({ port: this._port });
        this._server.on("connection", (socket : WebSocket, request : any) => this.onConnect(this, socket, request));
    }

    private onConnect(pipe : WebSocketPipe, socket : WebSocket, request : any)
    {
        //TODO: If there are zero connections, create the RtspProxy.

        let connection = new Connection(socket, (data : string) => { }, (_event: any, connection: Connection) => { this._connections.remove(connection); });
        connection.on(ConnectionEvent.LostHeartbeat, ()=>
        {
            console.log("Lost Heartbeat: ipcam");
            this._connections.remove (connection);
            connection.Close();

        //TODO: If there are zero connections left, destroy the RtspProxy.
    });

        this._connections.add(connection);
        

        // Send magic bytes and video size to the newly connected socket
        // struct { char magic[4]; unsigned short width, height;}
        let streamHeader = Buffer.alloc(8);
        streamHeader.write(WebSocketPipe.STREAM_MAGIC_BYTES);
        streamHeader.writeUInt16BE(this._width,  4);
        streamHeader.writeUInt16BE(this._height, 6);
        socket.send(streamHeader, { binary: true });
  
    }

    public Stop()
    {
        this._connections.removeAll();
        this._server?.close();
    }

    public Send(data : any)
    {
        this._connections.sendBinaryToAll(data);
    }
}
