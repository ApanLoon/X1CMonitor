import { FfmpegStream, FfmpegStreamEvent } from "./FfmpegStream.js";
import { WebSocketPipe } from "./WebsocketPipe.js";

export class RtspProxy
{
    private _ffmpegStream : FfmpegStream | undefined;
    private _webSocketPipe : WebSocketPipe | undefined;

    constructor (urlString : string, userName: string, password : string, port : number)
    {
        console.log("RtspProxy: Connecting to camera...");
        let url = new URL(urlString);
        url.username = userName;
        url.password = password;

        this._ffmpegStream = new FfmpegStream();
        this._webSocketPipe = new WebSocketPipe(port);

        this._ffmpegStream.on(FfmpegStreamEvent.Data, data => this._webSocketPipe?.Send(data));

        this._ffmpegStream.on(FfmpegStreamEvent.StreamStarted, ()=>
        {
            console.log("RtspPRoxy: Stream started");
            if (this._ffmpegStream === undefined)
            {
                return;
            }

            this._webSocketPipe?.Start(this._ffmpegStream.Width, this._ffmpegStream.Height);
        })

        this._ffmpegStream.Start(url.toString());
    }

    public Stop()
    {
        this._webSocketPipe?.Stop();
        this._ffmpegStream?.Stop();
    }
}
