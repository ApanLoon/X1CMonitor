<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "./plugins/IX1Client";

import Header from "./components/Header.vue"
import Ams from "./components/Ams.vue"
import Job from "./components/Job.vue"
import JsonDisplay from "./components/generic/JsonDisplay.vue";
import Lights from "./components/Lights.vue";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[App] Setup: No x1Client plugin found.");
}
x1Client.Connect(()=>
{
  console.log("[App] X1Client connected");
  x1Client.GetState();
});
</script>

<template>
  <Header></Header>

  <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Status.value !== undefined">
    <Job></Job>
    <Ams></Ams>
    <Lights></Lights>

    <div>lifecycle: {{ x1Client.Status.value.lifecycle }}</div>
    <div>nozzle: {{ x1Client.Status.value.nozzle_type }} {{ x1Client.Status.value.nozzle_diameter }}mm {{ x1Client.Status.value.nozzle_temper }}&deg;/{{ x1Client.Status.value.nozzle_target_temper }}&deg;</div>

    <local-box>
      <h2>Debug area</h2>
      <JsonDisplay :data="x1Client.Status.value" rootName="status"></JsonDisplay>
    </local-box>
  </template>
</template>

<style scoped>
local-box
{
  display: block;
  border: 1px solid var(--color-border);
  height: 500px;
  overflow: auto;
}
</style>

