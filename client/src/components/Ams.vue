<script setup lang="ts">
import { inject, computed } from "vue";
import type { IX1Client } from "@/plugins/IX1Client";
import type { Status } from "@/plugins/X1Messages";
import { AmsRfidStatus, AmsStatus2String } from "@/plugins/AmsTypes";
import BitDisplay from "./generic/BitDisplay.vue";
import IconAms from "./icons/IconAms.vue";
import IconBambuLab from "./icons/IconBambuLab.vue"
import IconSpool from "./icons/IconSpool.vue"

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[Ams] Setup: No x1Client plugin found.");
}

const status = computed<Status> (() =>
{
    return x1Client.Status.value;
});

const amsStatusString  = computed<string>(() => AmsStatus2String(x1Client.Status.value.ams_status));
const rfidStatusString = computed<string>(() => AmsRfidStatus[x1Client.Status.value.ams_rfid_status]);

const trayCount = computed<number> (() =>
{
    let n = 0;
    x1Client.Status.value.ams.ams.forEach(ams =>
    {
        n += ams.tray.length;
    });
    return n;
});

const checkBit = (index : number, bitString : string) =>
{
    let mask = Math.pow(2, index);
    let bits = Number("0x" + bitString);
    return ((bits & mask) != 0);
}

const isTrayReading = (amsIndex : string, trayIndex : string) =>
{
    let index = Number(amsIndex) * 4 + Number(trayIndex);
    return checkBit(index, x1Client.Status.value.ams.tray_reading_bits);
}
const isTrayRead = (amsIndex : string, trayIndex : string) =>
{
    let index = Number(amsIndex) * 4 + Number(trayIndex);
    return checkBit(index, x1Client.Status.value.ams.tray_read_done_bits);
}
const isTrayEmpty = (amsIndex : string, trayIndex : string) =>
{
    let index = Number(amsIndex) * 4 + Number(trayIndex);
    return checkBit(index, x1Client.Status.value.ams.tray_exist_bits) == false;
}

const isBbl = (amsIndex : string, trayIndex : string) =>
{
    let index = Number(amsIndex) * 4 + Number(trayIndex);
    return checkBit(index, x1Client.Status.value.ams.tray_is_bbl_bits);
}
</script>

<template>
    <local-ams>
        <local-ams-state>
            <local-header>
                <IconAms class="icon-ams"></IconAms>
                <h2>Status: {{ amsStatusString }}</h2>
                <h2>RFID: {{ rfidStatusString }}</h2>
            </local-header>
            
            <local-version>{{ status.ams.version }}</local-version>

            <h2 style="grid-area: units-header;">Units ({{ status.ams.ams.length }})</h2>
            <BitDisplay style="grid-area: units-exists" :lsbFirst="true" :bits="Number('0x' + status.ams.ams_exist_bits)"></BitDisplay>

            <h2 style="grid-area: trays-header">Trays ({{ trayCount }})</h2>

            <h2 style="grid-area: tray-exists-header">Exists:</h2>
            <BitDisplay style="grid-area: tray-exists" :lsbFirst="true" :bits="Number('0x' + status.ams.tray_exist_bits)"></BitDisplay>

            <h2 style="grid-area: tray-bbl-header">BBL:</h2>
            <BitDisplay style="grid-area: tray-bbl"     :lsbFirst="true" :bits="Number('0x' + status.ams.tray_is_bbl_bits)"></BitDisplay>

            <h2 style="grid-area: tray-reading-header">Reading:</h2>
            <BitDisplay style="grid-area: tray-reading" :lsbFirst="true" :bits="Number('0x' + status.ams.tray_reading_bits)" :minBits="trayCount">Reading:</BitDisplay>

            <h2 style="grid-area: tray-done-header">Done:</h2>
            <BitDisplay style="grid-area: tray-done"    :lsbFirst="true" :bits="Number('0x' + status.ams.tray_read_done_bits)"></BitDisplay>
        </local-ams-state>
        
        {{ status.ams.insert_flag }}
        {{ status.ams.power_on_flag }}
        {{ status.ams.tray_now }}
        {{ status.ams.tray_pre }}
        {{ status.ams.tray_tar }}
        

        <local-ams-instance v-for="ams in status.ams.ams">
            <div>
                <local-info><span>Id:</span><span>{{ ams.id }}</span></local-info>
                <local-info><span>Humidity:</span><span>{{ ams.humidity }}</span></local-info>
                <local-info><span>Temp:</span><span>{{ ams.temp }}&deg;</span></local-info>
            </div>
            <local-tray v-for="tray in ams.tray">
                <template v-if="isTrayReading(ams.id, tray.id)">
                    <IconSpool class="icon-spool"></IconSpool>
                </template>
                <template v-if="isTrayEmpty(ams.id, tray.id)">
                    <local-tray-text>
                        <div>Empty</div>
                    </local-tray-text>
                </template>
                <template  v-if="isTrayRead(ams.id, tray.id) && isTrayEmpty(ams.id, tray.id) === false">
                    <local-tray-fill :style="{'background-color': '#' + tray.tray_color, 'height': tray.remain + '%' }"></local-tray-fill>
                    <local-tray-text>
                        <IconBambuLab v-if="isBbl(ams.id, tray.id)"></IconBambuLab>
                        <div>{{ tray.tray_type }}</div>
                        <div>{{ tray.remain }}%</div>
                        <div>~{{ tray.remain / 100 * Number(tray.tray_weight) }}g</div>
                    </local-tray-text>
                </template>
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
      "logo         header             header       header              version"
      "units-header trays-header       trays-header trays-header        trays-header"
      "units-exists tray-exists-header tray-exists  tray-reading-header tray-reading"
      ".            tray-bbl-header    tray-bbl     tray-done-header    tray-done"
    ;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    column-gap: 0.5rem;
    position: relative;
}

.icon-ams
{
    grid-area: logo;
    position: absolute;
    top: 0;
    left: 0;
    width: auto;
    height: 0.33rem;
}

local-header
{
    grid-area: header;
    display: flex;
    gap: 0.5rem;
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

.icon-spool
{
    display: block;
    margin: auto;
    animation: spin 5s linear infinite ;
}
@keyframes spin
{
  100% {transform: rotate(360deg);}
}

local-tray local-tray-text
{
    color: white;
    filter:  brightness(.7);
    mix-blend-mode: difference;
    text-align: center;
}

local-tray local-tray-text svg
{
    position: absolute;
    bottom: 0px;
    right: 0px;
    margin: 0.2rem;
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
