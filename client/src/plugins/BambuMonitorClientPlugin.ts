import type { App } from "vue";
import type { IBambuMonitorClient } from "./IBambuMonitorClient";
import { BambuMonitorClientOptions, BambuMonitorClient } from "./BambuMonitorClient";

export default
{
    install: (app : App, options? : Partial<BambuMonitorClientOptions>) =>
    {
        const opts = new BambuMonitorClientOptions;
        Object.assign (opts, options);

        console.log("[BambuMonitorClient] Install: ", options);
        
        const bambuMonitorClient : IBambuMonitorClient = new BambuMonitorClient(opts);

        app.provide("BambuMonitorClient", bambuMonitorClient);
    }    
}