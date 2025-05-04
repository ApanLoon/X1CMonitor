import { FfmpegStream, FfmpegStreamEvent } from "./FfmpegStream.js";
import { CameraFeed } from "./CameraFeed.js";

export class RtspProxy
{
    private _ffmpegStream : FfmpegStream | undefined;

    constructor (urlString : string, userName: string, password : string, cameraFeed : CameraFeed)
    {
        console.log("RtspProxy: Connecting to camera...");
        let url = new URL(urlString);
        url.username = userName;
        url.password = password;

        this._ffmpegStream = new FfmpegStream();

        this._ffmpegStream.on(FfmpegStreamEvent.Data, data => cameraFeed?.Send(data));

        this._ffmpegStream.on(FfmpegStreamEvent.StreamStarted, ()=>
        {
            console.log("RtspPRoxy: Stream started");
            if (this._ffmpegStream === undefined)
            {
                return;
            }

            cameraFeed?.Start(this._ffmpegStream.Width, this._ffmpegStream.Height);
        })

        this._ffmpegStream.Start(url.toString());
    }

    public Stop()
    {
        console.log("RtspPRoxy: Stopping stream...");
        this._ffmpegStream?.Stop();
    }
}
