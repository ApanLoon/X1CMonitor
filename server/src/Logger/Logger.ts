import fs from "fs";
import Path from "path";

export class LoggerOptions
{
    public fileName : string = "./logs/log.txt";
}

interface Dictionary
{
    [key : string] : any;
}

export class Logger
{
    private options : LoggerOptions;

    private store : Dictionary = {};

    constructor (options : Partial<LoggerOptions>)
    {
        this.options = new LoggerOptions;
        Object.assign(this.options, options);
    }

    public Log(data : any, key : string)
    {
        if (key in this.store)
        {
            let l = this.findChanges(this.store[key], data, key);
            let timestamp = new Date().toISOString();
            let lines = "";
            l.forEach(change =>
            {
               let line = `${timestamp} ${change.path} changed from "${change.oldValue}" to "${change.newValue}".`;
               lines += `${line}\n`;
               console.log (line);
            });
            if (lines !== "")
            {
                let path = Path.dirname(this.options.fileName);
                if (fs.existsSync(path) === false)
                {
                    fs.mkdirSync(path, { recursive : true });
                }
                fs.appendFile(this.options.fileName, lines, { flush : true }, err => {if (err !== null) console.log (`Unable to write to "${this.options.fileName}". (${err})`);});
            }
        }
        this.store[key] = data;
    }

    private findChanges(oldData : any, newData : any, path : string) : Array<{path : string, oldValue : any, newValue : any }>
    {
        let l : Array<{path : string, oldValue : any, newValue : any }> = [];
        if (oldData === undefined || newData === undefined)
        {
            return l;
        }
        Object.keys(newData).forEach((key, index) =>
        {
            if (Object.hasOwn(oldData, key) === false || newData[key] !== oldData[key])
            {
                let propPath = path;
                if (Array.isArray(newData))
                {
                    propPath += `[${key}]`;
                }
                else
                {
                    propPath += `.${key}`;
                }
                
                switch (typeof(newData[key]))
                {
                    case "number":
                    case "boolean":
                    case "string":
                    case "bigint":
                        l.push({path : propPath, oldValue : oldData[key], newValue : newData[key] });
                            break;
                    case "object":
                        l.push(...this.findChanges(oldData[key], newData[key], propPath));
                        break;
                    default:
                        break;
                }
            }
        });
        return l;
    }
}
