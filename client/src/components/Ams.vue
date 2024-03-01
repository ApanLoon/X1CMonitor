<script setup lang="ts">
import { inject, computed } from 'vue';
import type { IX1Client } from '@/plugins/IX1Client';
import type { Print } from '@/plugins/X1MsgPrint';
import BitDisplay from "./generic/BitDisplay.vue";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("Ams.setup: No x1Client plugin found.");
}

const print = computed<Print> (() =>
{
    return x1Client.Print.value;
});

const trayCount = computed<number> (() =>
{
    let n = 0;
    x1Client.Print.value.ams.ams.forEach(ams =>
    {
        n += ams.tray.length;
    });
    return n;
});
</script>

<template>
    <local-ams>
        <local-ams-state>
            <BitDisplay style="grid-area: ams"          :lsbFirst="true"                :bits="Number('0x' + print.ams.ams_exist_bits)">AMS ({{ print.ams.ams.length }})</BitDisplay>
            <div style="grid-area: trays">Trays ({{ trayCount }})</div>
            <BitDisplay style="grid-area: tray-exists"  :lsbFirst="true" :inline="true" :bits="Number('0x' + print.ams.tray_exist_bits)">Exists:</BitDisplay>
            <BitDisplay style="grid-area: tray-bbl"     :lsbFirst="true" :inline="true" :bits="Number('0x' + print.ams.tray_is_bbl_bits)">BBL:</BitDisplay>
            <BitDisplay style="grid-area: tray-reading" :lsbFirst="true" :inline="true" :bits="Number('0x' + print.ams.tray_reading_bits)" :minBits="trayCount">Reading:</BitDisplay>
            <BitDisplay style="grid-area: tray-done"    :lsbFirst="true" :inline="true" :bits="Number('0x' + print.ams.tray_read_done_bits)">Done:</BitDisplay>
        </local-ams-state>
        
        {{ print.ams.insert_flag }}
        {{ print.ams.power_on_flag }}
        {{ print.ams.tray_now }}
        {{ print.ams.tray_pre }}
        {{ print.ams.tray_tar }}
        {{ print.ams.version }}

        <local-ams-instance v-for="ams in print.ams.ams">
            <div>
                <div>Id: {{ ams.id }}</div>
                <div>Humidity: {{ ams.humidity }}</div>
                <div>Temp: {{ ams.temp }}</div>
            </div>
            <local-tray v-for="tray in ams.tray">
                <local-tray-text :style="{'color': '#' + tray.tray_color }">
                    <div>{{ tray.tray_type }}</div>
                    <div>{{ tray.remain }}%</div>
                    <div>{{ tray.remain / 100 * Number(tray.tray_weight) }}g</div>
                </local-tray-text>
                <local-tray-fill :style="{'background-color': '#' + tray.tray_color, 'height': tray.remain + '%' }"></local-tray-fill>
            </local-tray>
        </local-ams-instance>
    </local-ams>
</template>

<style scoped>
local-ams {
    border: 1px solid var(--color-border);
}

local-ams-state {
    display: grid;
    grid-template-areas: "ams trays       trays"
                         "ams tray-exists tray-reading"
                         "ams tray-bbl    tray-done"
                         ;
}

local-ams-instance {
    display: grid;
    grid-auto-flow: column;
    position: relative;
}

local-tray {
    border: 1px solid var(--color-border);
}

local-tray local-tray-text {
    filter: saturate(0) grayscale(1) brightness(.7) contrast(1000%) invert(1);
    position: absolute;
    bottom: 0px;
}

local-tray local-tray-fill {
    display: block;
    border-top: 1px solid var(--color-border);
    position: absolute;
    width: 5rem;
    bottom: 0px;
    z-index: -100;
}
</style>
