import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import X1ClientPlugin from './plugins/X1ClientPlugin'

console.log("main.ts: Getting config...");
fetch ("config.json")
.then (response =>
{
    if (!response.ok)
    {
        throw new Error (`${response.status} ${response.statusText}`);
    }

    response.json()
    .then (config =>
    {
        const app = createApp(App);
        app.use(X1ClientPlugin, config);
        app.mount("#app");
    })
    .catch(error =>
    {
        console.log ("main.ts: Unable to get config. ", error);
    });
})
.catch(error=>
{
    console.log ("main.ts: Unable to get config. ", error);
});
