<script lang="ts" setup>
import { computed, inject } from "vue";
import type { IBambuMonitorClient } from "../../plugins/IBambuMonitorClient";

import Ams from "../Ams.vue"
import Job from "../Job.vue"
import JsonDisplay from "../generic/JsonDisplay.vue";
import Lights from "../Lights.vue";
import Temperature from "../Temperature.vue";
import { HomeFlag, SdCardState } from "../../../../server/src/shared/BambuMessages";

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[StatusPage] Setup: No BambuMonitorClient plugin found.");
}

const sdCardStateString = computed<string>(() => SdCardState[bambuMonitorClient.SdCardState.value]);
</script>

<template>
  <local-container>
    <template v-if="bambuMonitorClient.IsConnected.value && bambuMonitorClient.IsPrinterConnected.value && bambuMonitorClient.Status.value !== undefined">
        <Job></Job>
        <Temperature></Temperature>
        <Ams></Ams>
        <Lights></Lights>

        <local-home-flag>
          home_flag:
          <div>Axis home: 
            <span v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_x_axis_home)">X</span>
            <span v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_y_axis_home)">Y</span>
            <span v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_z_axis_home)">Z</span>
          </div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_220V_voltage)                   ">220V</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.xcam_auto_recovery_step_loss)      ">xcam_auto_recovery_step_loss</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.camera_recording)                  ">camera_recording</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.ams_calibrate_remain_flag)         ">ams_calibrate_remain_flag</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.ams_auto_switch_filament_flag)     ">ams_auto_switch_filament_flag</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.xcam_allow_prompt_sound)           ">xcam_allow_prompt_sound</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_prompt_sound)           ">is_support_prompt_sound</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_filament_tangle_detect) ">is_support_filament_tangle_detect</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.xcam_filament_tangle_detect)       ">xcam_filament_tangle_detect</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_motor_noise_cali)       ">is_support_motor_noise_cali</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_user_preset)            ">is_support_user_preset</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.nozzle_blob_detection_enabled)     ">nozzle_blob_detection_enabled</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_nozzle_blob_detection)  ">is_support_nozzle_blob_detection</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.installed_plus)                    ">installed_plus</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.supported_plus)                    ">supported_plus</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.ams_air_print_status)              ">ams_air_print_status</div>
          <div v-if="bambuMonitorClient.HomeFlag.value.has(HomeFlag.is_support_air_print_detection)    ">is_support_air_print_detection</div>
        </local-home-flag>
        <div>sdcard-state: {{  sdCardStateString }}</div>
        <div>lifecycle: {{ bambuMonitorClient.Status.value.lifecycle }}</div>
        <div>nozzle: {{ bambuMonitorClient.Status.value.nozzle_type }} {{ bambuMonitorClient.Status.value.nozzle_diameter }}mm {{ bambuMonitorClient.Status.value.nozzle_temper }}&deg;/{{ bambuMonitorClient.Status.value.nozzle_target_temper }}&deg;</div>

        <local-box>
            <h2>Debug area</h2>
            <JsonDisplay :data="bambuMonitorClient.Status.value" rootName="status"></JsonDisplay>
        </local-box>
    </template>
  </local-container>
</template>

<style scoped>
local-container
{
  display: grid;
  grid-template-rows: auto auto auto auto auto auto auto auto auto 340px; /* TODO: How do I makle it fill the remaining space? */
}
local-box
{
  display: block;
  border: 1px solid var(--color-border);
  overflow: auto;
}
local-home-flag *
{
  margin-left: 2rem;
}
</style>
