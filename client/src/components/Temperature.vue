<script setup lang="ts">
import { inject } from "vue";
import type { IBambuMonitorClient } from "@/plugins/IBambuMonitorClient";
import Thermometer from "./generic/Thermometer.vue"

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[App] Setup: No BambuMonitorClient plugin found.");
}
</script>

<template>
    <local-temperature>
        <!-- <div>
            <h2>Test</h2>
            <Thermometer :currentValue="220" :targetValue="220" :valueMin="0" :valueMax="300"></Thermometer>
        </div> -->
        <div>
            <h2>Nozzle</h2>
            <Thermometer :currentValue="Number(bambuMonitorClient.Status.value.nozzle_temper)" :targetValue="Number(bambuMonitorClient.Status.value.nozzle_target_temper)" :valueMin="0" :valueMax="300"></Thermometer>
        </div>
        <div>
            <h2>Bed</h2>
            <Thermometer :currentValue="Number(bambuMonitorClient.Status.value.bed_temper)" :targetValue="Number(bambuMonitorClient.Status.value.bed_target_temper)" :valueMin="0" :valueMax="250"></Thermometer>
        </div>
        <div>
            <h2>Chamber</h2>
            <Thermometer :currentValue="Number(bambuMonitorClient.Status.value.chamber_temper)" :valueMin="0" :valueMax="60"></Thermometer>
        </div>
    </local-temperature>
</template>

<style scoped>
h2 {text-align: center;}

local-temperature
{
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
}
</style>