<script setup lang="ts">
import type { IBambuMonitorClient } from '@/plugins/IBambuMonitorClient';
import { inject } from 'vue';

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[Lights] Setup: No BambuMonitorClient plugin found.");
}
</script>

<template>
    <div v-for="light in bambuMonitorClient.Status.value.lights_report">
        {{ light.node }}: {{ light.mode }}
    </div>
</template>
