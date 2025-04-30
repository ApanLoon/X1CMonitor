
export class Job
{
    public startTime : Date;
    public stopTime : Date | null;
    public name : string;
    public gcodeName : string;
    public state : string;

    constructor (
        startTime : Date = new Date(),
        stopTime : Date | null = null,
        name : string = "",
        gcodeName : string = "",
        state : string = ""
    )
    {
        this.startTime = startTime;
        this.stopTime = stopTime;
        this.name = name;
        this.gcodeName = gcodeName;
        this.state = state;
    }
}
