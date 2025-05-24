<script lang="ts" setup>
import { inject } from "vue";
import type { IBambuMonitorClient } from "../../plugins/IBambuMonitorClient";

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[LogPage] Setup: No BambuMonitorClient plugin found.");
}
</script>

<template>
    <local-container>
        <local-logmessage v-for="message in bambuMonitorClient.Log.value">
            <pre>{{ message }}</pre>
        </local-logmessage>
    </local-container>
</template>

<style scoped>
local-logmessage
{
    display: block;
    font-family: Consolas, 'Courier New', monospace;
}
</style>
