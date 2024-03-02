<script setup lang="ts">
import { inject, computed } from 'vue';
import type { IX1Client } from '@/plugins/IX1Client';
import type { Print } from '@/plugins/X1MsgPrint';
import BitDisplay from "./generic/BitDisplay.vue";
import IconAms from './icons/IconAms.vue';

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
            <IconAms class="icon-ams"></IconAms>

            <local-version>{{ print.ams.version }}</local-version>

            <h2 style="grid-area: units-header;">Units ({{ print.ams.ams.length }})</h2>
            <BitDisplay style="grid-area: units-exists" :lsbFirst="true" :bits="Number('0x' + print.ams.ams_exist_bits)"></BitDisplay>

            <h2 style="grid-area: trays-header">Trays ({{ trayCount }})</h2>

            <h2 style="grid-area: tray-exists-header">Exists:</h2>
            <BitDisplay style="grid-area: tray-exists" :lsbFirst="true" :bits="Number('0x' + print.ams.tray_exist_bits)"></BitDisplay>

            <h2 style="grid-area: tray-bbl-header">BBL:</h2>
            <BitDisplay style="grid-area: tray-bbl"     :lsbFirst="true" :bits="Number('0x' + print.ams.tray_is_bbl_bits)"></BitDisplay>

            <h2 style="grid-area: tray-reading-header">Reading:</h2>
            <BitDisplay style="grid-area: tray-reading" :lsbFirst="true" :bits="Number('0x' + print.ams.tray_reading_bits)" :minBits="trayCount">Reading:</BitDisplay>

            <h2 style="grid-area: tray-done-header">Done:</h2>
            <BitDisplay style="grid-area: tray-done"    :lsbFirst="true" :bits="Number('0x' + print.ams.tray_read_done_bits)"></BitDisplay>
        </local-ams-state>
        
        {{ print.ams.insert_flag }}
        {{ print.ams.power_on_flag }}
        {{ print.ams.tray_now }}
        {{ print.ams.tray_pre }}
        {{ print.ams.tray_tar }}
        

        <local-ams-instance v-for="ams in print.ams.ams">
            <div>
                <local-info><span>Id:</span><span>{{ ams.id }}</span></local-info>
                <local-info><span>Humidity:</span><span>{{ ams.humidity }}</span></local-info>
                <local-info><span>Temp:</span><span>{{ ams.temp }}&deg;</span></local-info>
            </div>
            <local-tray v-for="tray in ams.tray">
                <local-tray-fill :style="{'background-color': '#' + tray.tray_color, 'height': tray.remain + '%' }"></local-tray-fill>
                <local-tray-text>
                    <div>{{ tray.tray_type }}</div>
                    <div>{{ tray.remain }}%</div>
                    <div>~{{ tray.remain / 100 * Number(tray.tray_weight) }}g</div>
                </local-tray-text>
            </local-tray>
        </local-ams-instance>
    </local-ams>
</template>

<style scoped>
local-ams
{
    display: block;
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    margin-top: 0.5rem;
}

local-ams-state
{
    display: grid;
    grid-template-areas:
      "header       header             header       header              version"
      "units-header trays-header       trays-header trays-header        trays-header"
      "units-exists tray-exists-header tray-exists  tray-reading-header tray-reading"
      ".            tray-bbl-header    tray-bbl     tray-done-header    tray-done"
    ;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    grid-template-rows: 0.5rem 1fr 1fr 1fr;
    column-gap: 0.5rem;
    position: relative;
}

.icon-ams
{
    grid-area: header;
    position: absolute;
    top: 0;
    left: 0;
    width: auto;
    height: 0.33rem;
}

local-version
{
    grid-area: version;
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.5rem;
}

local-ams-instance
{
    display: grid;
    grid-auto-flow: column;
}

local-info
{
    display: flex;
    justify-content: space-between;
    margin-right: 0.5rem;
}

local-tray
{
    border: 1px solid var(--color-border);
    position: relative;
    transform: translateY(-50%);
    top: 50%;
}

local-tray local-tray-text
{
    color: white;
    filter:  brightness(.7);
    mix-blend-mode: difference;
    text-align: center;
}

local-tray local-tray-fill
{
    display: block;
    border-top: 1px solid var(--color-border);
    position: absolute;
    width: 100%;
    bottom: 0px;
    z-index: -10;
}
</style>
