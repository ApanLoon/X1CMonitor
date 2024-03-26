<script setup lang="ts">
import { inject, computed } from 'vue';
import type { IX1Client } from '@/plugins/IX1Client';
import { Stage } from "@/plugins/X1Messages";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[Ams] Setup: No x1Client plugin found.");
}
const StartTime = computed(()=>x1Client.Status.value.gcode_start_time === "0" ? "" : new Date(Number(x1Client.Status.value.gcode_start_time) * 1000).toLocaleString("sv-SE"));
const StageString   = computed<string>(() => Stage[x1Client.Status.value.stg_cur]);
const RemainingTime = computed<string>(() =>
{
    let minutes = x1Client.Status.value.mc_remaining_time;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
});
const EndTime = computed(()=>
{
  if (x1Client.Status.value.gcode_start_time === "0")
  {
    return "";
  }

  let seconds = Number(x1Client.Status.value.gcode_start_time) % 60;
  let endTime  = new Date();
  endTime.setSeconds(seconds);
  endTime.setMinutes(endTime.getMinutes() + x1Client.Status.value.mc_remaining_time);
  return endTime.toLocaleString("sv-SE");
});

</script>

<template>
    <local-job>
        <local-logo>Job</local-logo>
        <local-info><span>Sub task:</span><span>{{ x1Client.Status.value.subtask_name }}</span></local-info>
        <local-info><span>Stage:</span><span>{{ StageString }}</span></local-info>
        
        <local-info><span>Start time: {{ StartTime }}</span><span>End time: {{ EndTime }}</span></local-info>
        <local-info><span>Layer: {{ x1Client.Status.value.layer_num }}/{{ x1Client.Status.value.total_layer_num }}</span><span>{{x1Client.Status.value.mc_percent}}%</span><span>Reamining: {{ RemainingTime }}</span></local-info>
        <div><progress :value="x1Client.Status.value.mc_percent" min="0" max="100"></progress></div>

        <div>gcode: {{ x1Client.Status.value.gcode_state }} {{ x1Client.Status.value.gcode_file }} {{ x1Client.Status.value.gcode_start_time }}</div>
        <div>mc_print_sub_stage: {{x1Client.Status.value.mc_print_sub_stage}}</div>
        <div>print_real_action: {{x1Client.Status.value.print_real_action}}</div>
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
