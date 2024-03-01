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
    <div>
        <span>Backend is {{ x1Client.IsConnected.value === true ? "" : "not" }} connected</span>
    </div>
</template>
