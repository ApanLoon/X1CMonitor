import type { Ref } from "vue";
import { BambuMonitorClientOptions } from "./BambuMonitorClient";
import type { Job } from "../../../server/src/shared/Job";
import { HomeFlag, SdCardState, Status } from "../../../server/src/shared/BambuMessages";

export enum LogLevel
{
  Error       = 0,
  Warning     = 1,
  Information = 2,
  Debug       = 3,
  Trace       = 4
}

export interface IBambuMonitorClient
{
    Options : BambuMonitorClientOptions;
    IsConnected : Ref<boolean>;
    IsPrinterConnected : Ref<boolean>;

    Status      : Ref<Status>;
    HomeFlag    : Ref<HomeFlag>;
    SdCardState : Ref<SdCardState>;

    LogLevel: Ref<LogLevel>;
    Log: Ref<string[]>;

    CurrentJob: Ref<Job | null>;
    JobHistory: Ref<Array<Job>>;

    Connect(connectHandler? : () => void) : void;
    GetState() : void;
    SetPrinterLogLevel(level : LogLevel) : void;

    RequestJobHistory() : void;
    RequestFullLog() : void;
}