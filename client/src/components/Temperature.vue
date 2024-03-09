<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "@/plugins/IX1Client";
import Thermometer from "./generic/Thermometer.vue"

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[App] Setup: No x1Client plugin found.");
}
</script>

<template>
    <local-temperature>
        <Thermometer :dataValue="Number(x1Client.Status.value.nozzle_temper)" :dataMin="0" :dataMax="300"></Thermometer>
    </local-temperature>
</template>

<style scoped>
local-temperature
{
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    margin-top: 0.5rem;
    display: block;
}
</style>