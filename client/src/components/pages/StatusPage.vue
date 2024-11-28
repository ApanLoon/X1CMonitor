<script lang="ts" setup>
import { inject } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

import Ams from "../Ams.vue"
import Job from "../Job.vue"
import JsonDisplay from "../generic/JsonDisplay.vue";
import Lights from "../Lights.vue";
import Temperature from "../Temperature.vue";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}
</script>

<template>
  <local-container>
    <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Status.value !== undefined">
        <Job></Job>
        <Temperature></Temperature>
        <Ams></Ams>
        <Lights></Lights>

        <div>lifecycle: {{ x1Client.Status.value.lifecycle }}</div>
        <div>nozzle: {{ x1Client.Status.value.nozzle_type }} {{ x1Client.Status.value.nozzle_diameter }}mm {{ x1Client.Status.value.nozzle_temper }}&deg;/{{ x1Client.Status.value.nozzle_target_temper }}&deg;</div>

        <local-box>
            <h2>Debug area</h2>
            <JsonDisplay :data="x1Client.Status.value" rootName="status"></JsonDisplay>
        </local-box>
    </template>
  </local-container>
</template>

<style scoped>
local-container
{
  display: grid;
  grid-template-rows: auto auto auto auto auto auto auto 380px; /* TODO: How do I makle it fill the remaining space? */
}
local-box
{
  display: block;
  border: 1px solid var(--color-border);
  overflow: auto;
}
</style>
