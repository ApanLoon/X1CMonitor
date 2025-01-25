<script lang="ts" setup>
import { computed, inject } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

import Ams from "../Ams.vue"
import Job from "../Job.vue"
import JsonDisplay from "../generic/JsonDisplay.vue";
import Lights from "../Lights.vue";
import Temperature from "../Temperature.vue";
import { HomeFlag, SdCardState } from "../../../../server/src/shared/X1Messages";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}

const sdCardStateString = computed<string>(() => SdCardState[x1Client.SdCardState.value]);
</script>

<template>
  <local-container>
    <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Status.value !== undefined">
        <Job></Job>
        <Temperature></Temperature>
        <Ams></Ams>
        <Lights></Lights>

        <local-home-flag>
          home_flag:
          <div>Axis home: 
            <span v-if="x1Client.HomeFlag.value.has(HomeFlag.is_x_axis_home)">X</span>
            <span v-if="x1Client.HomeFlag.value.has(HomeFlag.is_y_axis_home)">Y</span>
            <span v-if="x1Client.HomeFlag.value.has(HomeFlag.is_z_axis_home)">Z</span>
          </div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_220V_voltage)                   ">220V</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.xcam_auto_recovery_step_loss)      ">xcam_auto_recovery_step_loss</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.camera_recording)                  ">camera_recording</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.ams_calibrate_remain_flag)         ">ams_calibrate_remain_flag</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.ams_auto_switch_filament_flag)     ">ams_auto_switch_filament_flag</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.xcam_allow_prompt_sound)           ">xcam_allow_prompt_sound</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_prompt_sound)           ">is_support_prompt_sound</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_filament_tangle_detect) ">is_support_filament_tangle_detect</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.xcam_filament_tangle_detect)       ">xcam_filament_tangle_detect</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_motor_noise_cali)       ">is_support_motor_noise_cali</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_user_preset)            ">is_support_user_preset</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.nozzle_blob_detection_enabled)     ">nozzle_blob_detection_enabled</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_nozzle_blob_detection)  ">is_support_nozzle_blob_detection</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.installed_plus)                    ">installed_plus</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.supported_plus)                    ">supported_plus</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.ams_air_print_status)              ">ams_air_print_status</div>
          <div v-if="x1Client.HomeFlag.value.has(HomeFlag.is_support_air_print_detection)    ">is_support_air_print_detection</div>
        </local-home-flag>
        <div>sdcard-state: {{  sdCardStateString }}</div>
        <div>lifecycle: {{ x1Client.Status.value.lifecycle }}</div>
        <div>nozzle: {{ x1Client.Status.value.nozzle_type }} {{ x1Client.Status.value.nozzle_diameter }}mm {{ x1Client.Status.value.nozzle_temper }}&deg;/{{ x1Client.Status.value.nozzle_target_temper }}&deg;</div>

        <local-box>
            <h2>Debug area</h2>
            <JsonDisplay :data="x1Client.Status.value" rootName="status"></JsonDisplay>
        </local-box>
    </template>
  </local-container>
</template>

<style scoped>
local-container
{
  display: grid;
  grid-template-rows: auto auto auto auto auto auto auto auto auto 350px; /* TODO: How do I makle it fill the remaining space? */
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
