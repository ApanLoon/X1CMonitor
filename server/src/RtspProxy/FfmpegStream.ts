import { EventEmitter } from "node:events";
import { spawn } from "child_process";

export const FfmpegStreamEvent = Object.freeze (
{
    Data:           "data",
    StreamStarted:  "streamstarted",
    Error:          "error",
    ExitWithError:  "exit-with-error"
});

enum State
{
    None,
    ReadInput,
    ReadOutput,
    ReadFrame
}

export class FfmpegStream extends EventEmitter
{
    public stream : any;

    public Width : number = 0;
    public Height : number = 0;
    public IsStreaming : boolean = false;

    private _state : State = State.None;

    private _inputData  : string[] = [];
    private _outputData : string[] = [];
    
    constructor ()
    {
        super();
    }

    public Start(url : string)
    {
        let ffmpegPath = "ffmpeg";
        let spawnOptions : string[] =
        [
            "-rtsp_transport",
            "tcp",
            "-i",
            url,
            '-f',
            'mpegts',
            '-codec:v',
            'mpeg1video',

            '-'
        ];
        this.stream = spawn(ffmpegPath, spawnOptions, 
        {
            detached: false
        });

        this._state = State.None;
        this._inputData = [];
        this._outputData = [];
        this.IsStreaming = false;

        this.stream.stdout.on("data", (data : any) => this.emit(FfmpegStreamEvent.Data, data));
        this.stream.stderr.on("data", (data : any) => this.parseStdErr(data));
        this.stream.on("exit", (code : number, signal : any) => 
        {
            if (code !== 0)
            {
                this.emit(FfmpegStreamEvent.ExitWithError, code);
            }
        });
    }

    public Stop()
    {
        this.IsStreaming = false;
        this.stream.kill();
    }

    private parseStdErr(data : any)
    {
        data = data.toString();

        // TODO: Handle actual errors

        if (data.indexOf("Input #") !== -1)
        {
            this._state = State.ReadInput;
        }

        if (data.indexOf("Output #") !== -1)
        {
            this._state = State.ReadOutput;
        }

        if (data.indexOf("frame") !== -1)
        {
            this._state = State.ReadFrame;
            if (this.IsStreaming === false)
            {
                this.IsStreaming = true;
                this.emit(FfmpegStreamEvent.StreamStarted);
            } 
        }
        
        switch (this._state)
        {
            case State.ReadInput:
                this._inputData.push(data);
                let size = data.match(/\d+x\d+/);
                if (size != null)
                {
                    size = size[0].split("x");
                    this.Width  = parseInt(size[0], 10);
                    this.Height = parseInt(size[1], 10);
                }
                break;

            case State.ReadOutput:
                break;
            case State.ReadFrame:
                break;
            case State.None:
                break;
            default:
                break;
        }
    }
}
