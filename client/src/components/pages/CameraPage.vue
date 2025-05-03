<script lang="ts" setup>
import { computed, inject, onMounted, ref, type Ref, watch } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

import ToggleSwitch from "../generic/ToggleSwitch.vue"

//@ts-ignore
import { JSMpeg } from "../../lib/jsmpeg/jsmpeg.min.js";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}

const IsCameraOn: Ref<boolean> = ref(false);
const CameraOnButtonText = computed<string>(() => IsCameraOn.value ? "Off" : "On" );
var player : any = null;

watch (IsCameraOn, (oldIsCameraOn, newIsCameraOn) =>
{
    newIsCameraOn ? stopCamera() : startCamera();
});

function startCamera()
{
    stopCamera();
    player = new JSMpeg.Player('ws://localhost:9999', 
    {
        autoplay: true,
        keepAliveInterval: 6,
        keepAliveMessage: { Type: "KeepAlive" },
        canvas: document.getElementById('canvas') // Canvas should be a canvas DOM element
    });
}

function stopCamera()
{
    if (player === null)
    {
        return;
    }
    player.destroy();
    player = null;
}

onMounted(()=>
{
});

</script>

<template>
    <local-container>
        <ToggleSwitch class="option" label="Enable camera" :isOn="IsCameraOn" @toggle="(isOn : boolean) => IsCameraOn = isOn"></ToggleSwitch>
        <canvas id="canvas" :class="{hidden: IsCameraOn === false}" width="1920" height="1080"></canvas>
        <local-cameradummy v-if="IsCameraOn === false">No camara feed</local-cameradummy>
    </local-container>
</template>

<style scoped>
local-container
{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
}

.option
{
    width: 25%;
}
canvas,
local-cameradummy
{
    margin-top: 0.5rem;
    display: block;
    width: 100%;
    aspect-ratio: 1.7777777777777777777777777777778;
    background-color: black;
    text-align: center;
}
.hidden
{
    display: none;
}
</style>
