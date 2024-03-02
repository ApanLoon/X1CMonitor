<script setup lang="ts">
import type { IX1Client } from '@/plugins/IX1Client';
import { inject } from 'vue';

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[Lights] Setup: No x1Client plugin found.");
}
</script>

<template>
    <div v-for="light in x1Client.Print.value.lights_report">
        {{ light.node }}: {{ light.mode }}
    </div>
</template>
