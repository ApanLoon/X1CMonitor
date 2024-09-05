import type { Ref } from "vue";
import { X1ClientOptions } from "./X1Client";
import { Status } from "../../../shared/src/X1Messages";

export interface IX1Client
{
    Options : X1ClientOptions;
    IsConnected : Ref<boolean>;
    IsPrinterConnected : Ref<boolean>;

    Status : Ref<Status>;

    Connect(connectHandler? : () => void) : void;
    GetState() : void;
}