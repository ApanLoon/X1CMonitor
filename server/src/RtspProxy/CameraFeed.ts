import WebSocket, { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { Connection, ConnectionCollection, ConnectionEvent } from "../Api/ConnectionCollection.js";
import { X1Client } from "../BambuClient/X1Client.js";
import { RtspProxy } from "./RtspProxy.js";

export class CameraFeedOptions
{
    X1Client   : X1Client | null = null;
    Port       : number = 9999;
    UserName   : string = "bblp";
    Password   : string = "";
}

export class CameraFeed extends EventEmitter
{
    private _options : CameraFeedOptions = new CameraFeedOptions();

    private _server : WebSocketServer | undefined;
    private _connections : ConnectionCollection = new ConnectionCollection;

    private static readonly STREAM_MAGIC_BYTES = "jsmp" // Must be 4 bytes

    private _rtspProxy : RtspProxy | undefined;
    private _width  : number = 0;
    private _height : number = 0;

    constructor (options : Partial<CameraFeedOptions>)
    {
        super();
        Object.assign(this._options, options);

        this._server = new WebSocketServer({ port: this._options.Port });
        this._server.on("connection", (socket : WebSocket, request : any) => this.onConnect(this, socket, request));
    }

    public Start(width : number, height : number)
    {
        this._width = width;
        this._height = height;
    }

    private onConnect(pipe : CameraFeed, socket : WebSocket, request : any)
    {
        //If there are zero connections, create the RtspProxy:
        if (this._connections.count() === 0 && this._options.X1Client?.status.ipcam !== undefined && this._options.X1Client?.status.ipcam.rtsp_url !== "" && this._rtspProxy === undefined)
        {
            this._rtspProxy = new RtspProxy(this._options.X1Client?.status.ipcam.rtsp_url, this._options.UserName, this._options.Password, this);
        }

        let connection = new Connection(socket, (data : string) => { }, (_event: any, connection: Connection) => { this._connections.remove(connection); });
        connection.on(ConnectionEvent.LostHeartbeat, ()=>
        {
            console.log("Lost Heartbeat: ipcam");
            this._connections.remove (connection);
            connection.Close();

            //If there are zero connections left, destroy the RtspProxy:
            if (this._connections.count() === 0)
            {
                this._rtspProxy?.Stop();
                this._rtspProxy = undefined;
            }
        });

        this._connections.add(connection);
        

        // Send magic bytes and video size to the newly connected socket
        // struct { char magic[4]; unsigned short width, height;}
        let streamHeader = Buffer.alloc(8);
        streamHeader.write(CameraFeed.STREAM_MAGIC_BYTES);
        streamHeader.writeUInt16BE(this._width,  4);
        streamHeader.writeUInt16BE(this._height, 6);
        socket.send(streamHeader, { binary: true });
  
    }

    public Stop()
    {
        this._connections.removeAll();
        this._server?.close();
        this._rtspProxy?.Stop();
    }

    public Send(data : any)
    {
        this._connections.sendBinaryToAll(data);
    }
}
