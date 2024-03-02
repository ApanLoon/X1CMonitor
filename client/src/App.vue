<script setup lang="ts">
import { inject } from "vue";
import type { IX1Client } from "./plugins/IX1Client";

import Header from "./components/Header.vue"
import Ams from "./components/Ams.vue"
import Lights from "./components/Lights.vue";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("App.setup: No x1Client plugin found.");
}
x1Client.Connect(()=>
{
  console.log("Connected!");
});

</script>

<template>
  <Header></Header>

  <Ams></Ams>
  <Lights></Lights>
</template>

