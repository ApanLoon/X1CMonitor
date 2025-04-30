import { Project } from "./Project.js";

export class Job
{
    public StartTime : Date;
    public StopTime : Date | null = null;
    public Name : string;
    public GcodeName : string;
    public State : string;

    public Project : Project | null = null;

    constructor (
        startTime : Date = new Date(),
        stopTime : Date | null = null,
        name : string = "",
        gcodeName : string = "",
        state : string = "",
        project : Project | null = null
    )
    {
        this.StartTime = startTime;
        this.StopTime = stopTime;
        this.Name = name;
        this.GcodeName = gcodeName;
        this.State = state;
        this.Project = project;
    }
}
