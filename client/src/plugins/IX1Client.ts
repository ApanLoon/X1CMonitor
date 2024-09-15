import type { Ref } from "vue";
import { X1ClientOptions } from "./X1Client";
import { Status } from "../../../shared/src/X1Messages";

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

    Status : Ref<Status>;
    LogLevel: Ref<LogLevel>;

    Connect(connectHandler? : () => void) : void;
    GetState() : void;
    SetPrinterLogLevel(level : LogLevel) : void;
}