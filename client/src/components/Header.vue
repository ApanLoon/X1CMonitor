<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "@/plugins/IX1Client";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[Header] Setup: No x1Client plugin found.");
}
</script>

<template>
  <local-header>
    <img alt="X1CMonitor logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
    <div>
      <h1>X1C Monitor</h1>
      <div>Backend is {{ x1Client.IsConnected.value        === true ? "" : "not" }} connected</div>
      <div v-if="x1Client.IsConnected.value">Printer is {{ x1Client.IsPrinterConnected.value === true ? "" : "not" }} connected</div>
    </div>

  </local-header>
</template>

<style scoped>
local-header {
  display: flex;
}

h1
{
  margin-top: -0.2em; /* TODO: This is sensitive to the font-family */
}
</style>
