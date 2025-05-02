import { v4 as Uuid } from "uuid";
import { Project } from "./Project.js";

export enum JobState
{
    Started  = 0,
    Finished = 1,
    Failed   = 2
};

export class Job
{
    public Id        : string = Uuid();
    public StartTime : Date;
    public StopTime  : Date | null = null;
    public Name      : string;
    public GcodeName : string;
    public State     : JobState;

    public Project : Project | null = null;

    constructor (
        id        : string         = Uuid(),
        startTime : Date           = new Date(),
        stopTime  : Date | null    = null,
        name      : string         = "",
        gcodeName : string         = "",
        state     : JobState       = JobState.Started,
        project   : Project | null = null
    )
    {
        this.Id        = id;
        this.StartTime = startTime;
        this.StopTime  = stopTime;
        this.Name      = name;
        this.GcodeName = gcodeName;
        this.State     = state;
        this.Project   = project;
    }
}
