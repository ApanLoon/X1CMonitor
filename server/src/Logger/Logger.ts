import fs from "fs";
import rd from "readline";
import Path from "path";
import { type Change } from "../X1Client/CompareObjects.js"
import { EventEmitter } from "node:events";
import { Job } from "../shared/Job.js";
import { GCodeState } from "../shared/X1Messages.js";

export class LoggerOptions
{
    public fileName : string = "./logs/log.txt";
}

export const LoggerEvent = Object.freeze (
{
    MessageLogged:      "messagelogged"
});

export class Logger extends EventEmitter
{
    private options : LoggerOptions;

    constructor (options : Partial<LoggerOptions>)
    {
        super();
        this.options = new LoggerOptions;
        Object.assign(this.options, options);
    }

    public Log(message : string, raw? : boolean)
    {
        let lines = raw ? message : this.createLine(message);

        let path = Path.dirname(this.options.fileName);
        if (fs.existsSync(path) === false)
        {
            fs.mkdirSync(path, { recursive : true });
        }
        fs.appendFile(this.options.fileName, lines, { flush : true },
            err => {if (err !== null) console.log (`Unable to write to "${this.options.fileName}". (${err})`);});

        console.log (lines.trimEnd());
        this.emit(LoggerEvent.MessageLogged, lines);
    }

    public LogChange(change : Change)
    {
        let timestamp = new Date().toISOString();
        let line = `${timestamp} ${change.path} changed from "${change.oldValue}" to "${change.newValue}".\n`;
        this.Log(line, true);
    }

    private createLine(message : string) : string
    {
        let timestamp = new Date().toISOString();
        return `${timestamp} ${message}\n`;
    }

    public SendFullLog()
    {
        if (fs.existsSync(this.options.fileName) === false)
        {
            return;
        }

        let reader = rd.createInterface (fs.createReadStream(this.options.fileName));
        reader.on("line", (l : string) =>
        {
            this.emit(LoggerEvent.MessageLogged, l);
        })
        reader.on("close", () =>
        {
        });
    }

    public MillisecondsToString(milliseconds : number ) : string
    {
        let total = milliseconds;
        let hours = Math.floor (total / (60 * 60 * 1000));
        total = total % (60 * 60 * 1000);

        let minutes = Math.floor (total / (60 * 1000));
        total = total % (60 * 1000);

        let seconds = Math.floor (total / (1000));
        total = total % (1000);

        return `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    }

    public LogJobStopped(job: Job) : void
    {
        let status = job.State === GCodeState.Failed ? "failed" : "completed";
        
        let duration = "unknown";
        if (job.StopTime !== null)
        {
            duration = this.MillisecondsToString(job.StopTime.getTime() - job.StartTime.getTime());
        }
        let line = `${job.StopTime?.toISOString()} Job ${status} ("${job.Name}" Duration ${duration}).\n`;
        this.Log(line, true);
    }
}
