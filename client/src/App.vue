<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "./plugins/IX1Client";

import Header from "./components/Header.vue"
import Ams from "./components/Ams.vue"
import Lights from "./components/Lights.vue";
import JsonDisplay from "./components/generic/JsonDisplay.vue";

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

  <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Print.value !== undefined">
    <Ams></Ams>
    <Lights></Lights>

    <local-box>
      <h2>Debug area</h2>
      <JsonDisplay :data="x1Client.Print.value" rootName="print"></JsonDisplay>
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

