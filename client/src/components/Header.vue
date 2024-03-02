<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "@/plugins/IX1Client";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("Header.setup: No x1Client plugin found.");
}
</script>

<template>
  <local-header>
    <img alt="X1CMonitor logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
    <div>
      <h1>X1C Monitor</h1>
      <div>Backend is {{ x1Client.IsConnected.value === true ? "" : "not" }} connected</div>
      <local-printer>Printer is {{ x1Client.IsConnected.value === true ? "" : "not" }} connected</local-printer>
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

local-printer {
  /* TODO: Remove this when we have an actual state for printer connection status */
  text-decoration: line-through;
}
</style>
