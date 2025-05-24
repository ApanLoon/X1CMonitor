<script setup lang="ts">
import { inject } from "vue";
import type { IBambuMonitorClient } from "./plugins/IBambuMonitorClient";

import Header from "./components/Header.vue";

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[App] Setup: No BambuMonitorClient plugin found.");
}
bambuMonitorClient.Connect(()=>
{
  console.log("[App] BambuMonitorClient connected");
  bambuMonitorClient.GetState();
  bambuMonitorClient.RequestFullLog();
});
</script>

<template>
  <local-view>
    <Header></Header>
    <local-page>
      <RouterView />
    </local-page>
  </local-view>
</template>

<style scoped>
local-view
{
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 2rem;
}
local-page
{
  overflow: auto;
}
</style>