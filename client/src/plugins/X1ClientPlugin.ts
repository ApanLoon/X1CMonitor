import type { App } from "vue";
import type { IX1Client } from "./IX1Client";
import { X1ClientOptions, X1Client } from "./X1Client";

export default
{
    install: (app : App, options? : Partial<X1ClientOptions>) =>
    {
        const opts = new X1ClientOptions;
        Object.assign (opts, options);

        console.log("[X1Client] Install: ", options);
        
        const x1Client : IX1Client = new X1Client(opts);

        app.provide("x1Client", x1Client);
    }    
}