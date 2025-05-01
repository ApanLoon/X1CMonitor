export class Change
{
    public path : string = "";
    public oldValue : any;
    public newValue : any;
    public timestamp : Date;

    constructor(
        path : string,
        oldValue : any,
        newValue : any,
        timestamp : Date = new Date()
    )
    {
        this.path = path;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.timestamp = timestamp;
    }
}

export function CompareObjects (oldData : any, newData : any, path : string) : Array<Change>
{
    let l : Array<Change> = [];
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
                    l.push(new Change (propPath, oldData[key], newData[key]));
                        break;
                case "object":
                    l.push(...CompareObjects(oldData[key], newData[key], propPath));
                    break;
                default:
                    break;
            }
        }
    });
    return l;
}
