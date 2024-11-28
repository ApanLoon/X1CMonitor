import './assets/main.css'

import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';

import X1ClientPlugin from './plugins/X1ClientPlugin'

import StatusPage from "./components/pages/StatusPage.vue";
import LogPage from "./components/pages/LogPage.vue";

const routes =
[
    { path: "/",    component: StatusPage },
    { path: "/log", component: LogPage    }
];

console.log("[main] Getting config...");
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
        const router = createRouter(
            {
                history: createMemoryHistory(),
                routes
            }
        );
        
        const app = createApp(App);
        app.use(X1ClientPlugin, config);
        app.use(router);
        app.mount("#app");
    })
    .catch(error =>
    {
        console.log ("[main] Unable to get config. ", error);
    });
})
.catch(error=>
{
    console.log ("[main] Unable to get config. ", error);
});
