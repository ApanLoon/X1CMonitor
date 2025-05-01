import { Database } from "../Database/Database.js";
import { Job, JobState } from "../shared/Job.js";
import { Project } from "../shared/Project.js";
import { GCodeState } from "../shared/X1Messages.js";
import { type Change } from "../X1Client/CompareObjects.js"
import { EventEmitter } from "node:events";

export class JobManagerOptions
{
  Database?  : Database;
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
    public CurrentJob : Job | null = null;

    private _options : JobManagerOptions = new JobManagerOptions;
    private _status : any = {};

    constructor(options : Partial<JobManagerOptions>)
    {
        super();
        Object.assign(this._options, options);
    }

    public CancelCurrentJob()
    {
        this.CurrentJob = null;
        this.emit (JobEvent.JobUpdated, this.CurrentJob);
    }
    
    public HandleStatus(status : any)
    {
        if (this.CurrentJob !== null && this.CurrentJob.Name !== status.subtask_name)
        {
            // The current job doesn't match the running job. What to do?
            this.CancelCurrentJob();
        }

        if (this.CurrentJob === null && (status.gcode_state === GCodeState.Running || status.gcode_state === GCodeState.Pause))
        {
            // TODO: Get latest running job from database
            // TODO: If it is the same job as we think that we are starting now, use the one from the database
            // TODO: If it is NOT the same job as we think that we are starting now, stop the job from the database and create a new one

            this.CurrentJob = new Job();
            this.CurrentJob.StartTime = new Date();
            this.CurrentJob.Name = status.subtask_name;
            this.CurrentJob.GcodeName = status.gcode_file;
            this.CurrentJob.State = JobState.Started;

            this.emit (JobEvent.JobGetProject, this.CurrentJob);
            this.emit (JobEvent.JobUpdated, this.CurrentJob);
        }

        if (this.CurrentJob !== null && (status.gcode_state === GCodeState.Failed || status.gcode_state === GCodeState.Finish))
        {
            this.CurrentJob.StopTime = new Date();
            this.CurrentJob.State = status.gcode_state === GCodeState.Failed ? JobState.Failed : JobState.Finished;
            this.emit (JobEvent.JobUpdated, this.CurrentJob); // NOTE: This will hopefully trigger a database update. TODO: Woiuld it be better to explicitly call the database from here when creating, updating or stopping jobs? 
            this.CancelCurrentJob();
        }
    }

    public HandleProjectLoaded(project : Project, job : Job)
    {
        if (this.CurrentJob === null)
        {
            return;
        }
        this.CurrentJob.Project = project; // TODO: Should probably verify that the given job is the same as the Current job.
        this.emit (JobEvent.JobUpdated, this.CurrentJob);
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
