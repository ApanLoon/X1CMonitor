<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "./plugins/IX1Client";

import Header from "./components/Header.vue";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[App] Setup: No x1Client plugin found.");
}
x1Client.Connect(()=>
{
  console.log("[App] X1Client connected");
  x1Client.GetState();
  x1Client.RequestFullLog();
});
</script>

<template>
  <local-view>
    <Header></Header>
    <local-page>
      <RouterView />
    </local-page>
  </local-view>
</template>

<style scoped>
local-view
{
  display: flex;
  flex-direction: column;
  height: 100vh;
}
local-page
{
  overflow: auto;
}
</style>