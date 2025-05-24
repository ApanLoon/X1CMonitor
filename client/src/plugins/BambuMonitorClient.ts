
import { ref, type Ref } from "vue";
import { type IBambuMonitorClient, LogLevel } from "./IBambuMonitorClient";
import { Job } from "../../../server/src/shared/Job";
import { BambuMonitorClientMessage, BambuMonitorServerMessage } from "../../../server/src/shared/BambuMonitorApi";
import { HomeFlag, SdCardState, Status } from "../../../server/src/shared/BambuMessages";

export class BambuMonitorClientOptions
{
    public Host : string = "localhost";
    public Port : number = 4000;
}

export class BambuMonitorClient implements IBambuMonitorClient
{
    Options: BambuMonitorClientOptions;
    IsConnected: Ref<boolean> = ref(false);
    IsPrinterConnected : Ref<boolean> = ref(false);

    Status: Ref<Status> = ref(new Status);

    public HomeFlag    : Ref<HomeFlag> = ref(new HomeFlag());
    public SdCardState : Ref<SdCardState> = ref(SdCardState.NO_SDCARD);
    
    LogLevel: Ref<LogLevel> = ref(LogLevel.Information);
    Log: Ref<string[]> = ref([]);

    CurrentJob: Ref<Job | null> = ref(null);
    JobHistory: Ref<Array<Job>> = ref([]);

    private _socket? : WebSocket;
    private _keepAliveInterval = 5000;
    private _keepAlive : ReturnType<typeof setInterval> | null = null;

    constructor(options : BambuMonitorClientOptions)
    {
        this.Options = options;
    }

    public Connect(connectHandler? : () => void) : void
    {
        console.log(`[BambuMonitorClient] Connecting to ${this.Options.Host}:${this.Options.Port}...`);

        this._socket = new WebSocket(`ws://${this.Options.Host}:${this.Options.Port}`);

        this._socket.addEventListener("open", () => 
        {
            console.log(`[BambuMonitorClient] Connected to ${this.Options.Host}:${this.Options.Port}`);
            this.IsConnected.value = true;
            this._keepAlive = window.setInterval(()=>this._socket?.send(JSON.stringify({Type: "KeepAlive"})), this._keepAliveInterval);

            if (connectHandler)
            {
                connectHandler();
            }
        });
        
        this._socket.addEventListener("message", (event) => 
        {
            const msg = JSON.parse(event.data);
        
            switch (msg.Type)
            {
                case BambuMonitorClientMessage.Status:                  this.updateStatus(msg.Status as Status);                   break;
                case BambuMonitorClientMessage.PrinterConnectionStatus: this.IsPrinterConnected.value = msg.IsConnected;           break;
                case BambuMonitorClientMessage.PrinterLogLevel:         this.LogLevel.value           = msg.Level as LogLevel;     break;
                case BambuMonitorClientMessage.MessageLogged:           this.Log.value.push (msg.Message);                         break;
                case BambuMonitorClientMessage.CurrentJob:              this.UpdateCurrentJob (msg.Job);                           break;
                case BambuMonitorClientMessage.JobHistory:              this.UpdateJobHistory (msg.Jobs);                          break;
            }
        });

        this._socket.onclose = error =>
        {
            console.log("[BambuMonitorClient] Connection closed.", error);
            this.IsConnected.value = false;
            if (this._keepAlive != null) window.clearInterval(this._keepAlive);
            window.setTimeout(()=>this.Connect(connectHandler), 1000);
        }
    }

    private UpdateCurrentJob(job : Job)
    {
        if (job !== null)
        {
            job.StartTime = new Date(job.StartTime);
            job.StopTime = job.StopTime == null ? null : new Date(job.StopTime);
        }
        this.CurrentJob.value = job;
    }

    private UpdateJobHistory(jobs : Array<Job>)
    {
        jobs.forEach(job =>
        {
            job.StartTime = new Date(job.StartTime);
            job.StopTime = job.StopTime == null ? null : new Date(job.StopTime);
    
        });
        this.JobHistory.value = jobs;
    }

    private updateStatus(status : Status)
    {
        this.Status.value      = status;
        this.HomeFlag.value    = new HomeFlag(status?.home_flag);
        this.SdCardState.value = this.HomeFlag.value.sdCardState();    
    }

    GetState(): void
    {
        this._socket?.send(JSON.stringify(
        {
            Type: BambuMonitorServerMessage.GetState
        }));
    }

    SetPrinterLogLevel(level : LogLevel)
    {
        this._socket?.send(JSON.stringify(
        {
            Type: BambuMonitorServerMessage.SetPrinterLogLevel,
            Level: level
        }));
    }

    RequestJobHistory()
    {
        this.Log.value = [];
        this._socket?.send(JSON.stringify(
        {
            Type: BambuMonitorServerMessage.RequestJobHistory
        }));
    }

    RequestFullLog()
    {
        this.Log.value = [];
        this._socket?.send(JSON.stringify(
        {
            Type: BambuMonitorServerMessage.RequestFullLog
        }));
    }
}
