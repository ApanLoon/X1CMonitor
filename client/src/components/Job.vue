<script setup lang="ts">
import { inject, computed } from 'vue';
import type { IBambuMonitorClient } from '@/plugins/IBambuMonitorClient';
import { Stage } from "../../../server/src/shared/BambuMessages";

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[Ams] Setup: No BambuMonitorClient plugin found.");
}

const StartTime = computed(()=>bambuMonitorClient.Status.value.gcode_start_time === undefined || bambuMonitorClient.Status.value.gcode_start_time === "0"
  ? "Unknown"
  : new Date(Number(bambuMonitorClient.Status.value.gcode_start_time) * 1000).toLocaleString("sv-SE"));

const StageString   = computed<string>(() => Stage[bambuMonitorClient.Status.value.stg_cur]);

const RemainingTime = computed<string>(() =>
{
    let minutes = bambuMonitorClient.Status.value.mc_remaining_time;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
});

const EndTime = computed(()=>
{
  if (bambuMonitorClient.Status.value.gcode_start_time === undefined || bambuMonitorClient.Status.value.gcode_start_time === "0")
  {
    return "Unknown";
  }

  let seconds = Number(bambuMonitorClient.Status.value.gcode_start_time) % 60;
  let endTime  = new Date();
  endTime.setSeconds(seconds);
  endTime.setMinutes(endTime.getMinutes() + bambuMonitorClient.Status.value.mc_remaining_time);
  return endTime.toLocaleString("sv-SE");
});

</script>

<template>
    <local-job>
        <local-logo>Job</local-logo>
        <local-info><span>Sub task:</span><span>{{ bambuMonitorClient.Status.value.subtask_name }}</span></local-info>
        <local-info><span>Stage:</span><span>{{ StageString }}</span></local-info>
        
        <local-info><span>Start time: {{ StartTime }}</span><span>End time: {{ EndTime }}</span></local-info>
        <local-info><span>Layer: {{ bambuMonitorClient.Status.value.layer_num }}/{{ bambuMonitorClient.Status.value.total_layer_num }}</span><span>{{bambuMonitorClient.Status.value.mc_percent}}%</span><span>Remaining: {{ RemainingTime }}</span></local-info>
        <div><progress :value="bambuMonitorClient.Status.value.mc_percent" min="0" max="100"></progress></div>

        <div>gcode: {{ bambuMonitorClient.Status.value.gcode_state }} {{ bambuMonitorClient.Status.value.gcode_file }} {{ bambuMonitorClient.Status.value.gcode_start_time }}</div>
        <div>mc_print_sub_stage: {{bambuMonitorClient.Status.value.mc_print_sub_stage}}</div>
        <div>print_real_action: {{bambuMonitorClient.Status.value.print_real_action}}</div>
    </local-job>
</template>

<style scoped>
local-job
{
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    margin-top: 0.5rem;
    display: block;
    /*
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
    */
}

local-logo
{
    grid-area: logo;
}

local-info
{
    display: flex;
    justify-content: space-between;
    margin-right: 0.5rem;
}
progress
{
  border: 1px solid var(--color-border);
  border-radius: 0.5rem; 
  width: 100%;
  height: 1rem;
}
progress::-webkit-progress-bar
{
  background-color: var(--color-background);
  border-radius: 0.5rem;
}
progress::-webkit-progress-value
{
  background-color: var(--color-on);
  border-radius: 0.5rem;
}
/*
progress::-moz-progress-bar
{
}
*/
</style>
