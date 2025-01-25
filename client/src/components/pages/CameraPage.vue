<script lang="ts" setup>
import { computed, inject, onMounted } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

//@ts-ignore
import { JSMpeg } from "../../lib/jsmpeg.min.js";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}

onMounted(()=>
{
    player = new JSMpeg.Player('ws://localhost:9999', 
    {
        canvas: document.getElementById('canvas') // Canvas should be a canvas DOM element
    });
});
var player : any;

</script>

<template>
    <div>
        <canvas id="canvas" width="1920" height="1080"></canvas>
    </div>
</template>

<style scoped>
canvas
{
    width: 100%;
}
</style>
