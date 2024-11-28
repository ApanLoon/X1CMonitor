<script lang="ts" setup>
import { inject } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[LogPage] Setup: No x1Client plugin found.");
}
</script>

<template>
    <local-container>
        <local-logmessage v-for="message in x1Client.Log.value">
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
