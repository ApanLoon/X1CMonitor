import { Project } from "../shared/Project.js";
import { GCodeState } from "../shared/X1Messages.js";
import { type Change } from "../X1Client/CompareObjects.js"
import { EventEmitter } from "node:events";

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

export const JobEvent = Object.freeze (
{
    JobStarted:      "jobstarted",
    JobUpdated:      "jobupdated",
    JobFailed:       "jobfailed",
    JobCompleted:    "jobcompleted",
    JobGetProject:   "jobgetproject"
});

export class JobManager extends EventEmitter
{
    private _currentJob : Job | null = null;
    private _status : any = {};

    constructor()
    {
        super();
    }

    public CancelCurrentJob()
    {
        this._currentJob = null;
    }
    
    public HandleStatus(status : any)
    {
        if (status.gcode_state === GCodeState.Running || status.gcode_state === GCodeState.Pause)
        {
            if (this._currentJob !== null && this._currentJob.name !== status.subtask_name)
            {
                this.CancelCurrentJob();
            }

            if (this._currentJob === null)
            {
                console.log("Apa");
                this._currentJob = new Job();
                this._currentJob.startTime.setTime(Number(status.gcode_start_time));
                this._currentJob.name = status.subtask_name;
                this._currentJob.gcodeName = status.gcode_file;
                this._currentJob.state = status.gcode_state;
                console.log(this._currentJob);
                this.emit(JobEvent.JobGetProject, this._currentJob);
                this.emit (JobEvent.JobUpdated, this._currentJob);
            }
        }
    }

    public HandleProjectLoaded(project : Project, job : Job)
    {
        console.log("JobManager.HandleProjectLoaded: ", project);
    }

    public HandleChange(change : Change)
    {
        // console.log("A1"); // TODO: How do we set the current job if the server was started while a job was in progress?
        // if (this._currentJob === null &&
        //     (
        //            (change.path === "status.gcode_start_time")
        //         || (change.path === "status.gcode_file" && change.newValue !== "" )
        //         || (change.path === "status.gcode_state" && change.newValue === GCodeState.Running &&
        //                 (      change.oldValue === GCodeState.Idle
        //                     || change.oldValue === GCodeState.Failed
        //                     || change.oldValue === GCodeState.Finish
        //                 )
        //             )
        //     )
        // )
        // {
        //     console.log("Apa");
        //     this._currentJob = new Job();
        //     this.emit(JobEvent.JobGetProject, this._currentJob);
        // }
        // if (this._currentJob === null)
        // {
        //     return;
        // }

        // // Update current job:
        // var noChange = false;
        // switch (change.path)
        // {
        //     case "status.gcode_start_time": 
        //         this._currentJob.startTime = new Date();
        //         this._currentJob.startTime.setTime (Number(change.newValue));
        //     break;
            
        //     case "status.gcode_file":
        //         this._currentJob.gcodeName = change.newValue !== "" ? change.newValue : this._currentJob.gcodeName;
        //     break; 
            
        //     case "status.gcode_state":
        //         this._currentJob.state = change.newValue;
        //     break; 
            
        //     case "status.subtask_name":
        //         this._currentJob.name = change.newValue;
        //     break;

        //     default:
        //         noChange = true;
        //     break;
        // }

        // if (noChange === true)
        // {
        //     return;
        // }

        // if (   this._currentJob.state === GCodeState.Finish
        //     || this._currentJob.state === GCodeState.Idle
        // )
        // {
        //     this.emit (JobEvent.JobCompleted, this._currentJob);
        //     this._currentJob = null;
        //     return;
        // }

        // if (this._currentJob.state === GCodeState.Failed)
        // {
        //     this.emit (JobEvent.JobFailed, this._currentJob);
        //     this._currentJob = null;
        //     return;
        // }

        // this.emit (JobEvent.JobUpdated, this._currentJob);
    }
}
