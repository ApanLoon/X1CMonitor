import type { Ref } from "vue";
import { X1ClientOptions } from "./X1Client";
import { Print } from "./X1MsgPrint";

export interface IX1Client
{
    Options : X1ClientOptions;
    IsConnected : Ref<boolean>;

    Print : Ref<Print>;

    Connect(connectHandler? : () => void) : void;
}