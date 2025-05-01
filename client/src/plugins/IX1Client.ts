import type { Ref } from "vue";
import { X1ClientOptions } from "./X1Client";
import { Status } from "../../../server/src/shared/X1Messages";
import type { Job } from "../../../server/src/shared/Job";
import { HomeFlag, SdCardState, Status } from "../../../server/src/shared/X1Messages";

export enum LogLevel
{
  Error       = 0,
  Warning     = 1,
  Information = 2,
  Debug       = 3,
  Trace       = 4
}

export interface IX1Client
{
    Options : X1ClientOptions;
    IsConnected : Ref<boolean>;
    IsPrinterConnected : Ref<boolean>;

    Status      : Ref<Status>;
    HomeFlag    : Ref<HomeFlag>;
    SdCardState : Ref<SdCardState>;

    LogLevel: Ref<LogLevel>;
    Log: Ref<string[]>;

    CurrentJob: Ref<Job | null>;

    Connect(connectHandler? : () => void) : void;
    GetState() : void;
    SetPrinterLogLevel(level : LogLevel) : void;
    RequestFullLog() : void;
}