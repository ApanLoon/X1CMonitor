<script lang="ts" setup>
import { inject } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

import Ams from "../Ams.vue"
import Job from "../Job.vue"
import JsonDisplay from "../generic/JsonDisplay.vue";
import Lights from "../Lights.vue";
import Temperature from "../Temperature.vue";
import { HomeFlag } from "../../../../server/src/shared/X1Messages";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}
</script>

<template>
  <local-container>
    <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Status.value !== undefined">
        <Job></Job>
        <Temperature></Temperature>
        <Ams></Ams>
        <Lights></Lights>

        <local-home-flag>
          home_flag: {{ x1Client.Status.value.home_flag }}
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_220V_voltage)                   != 0">is_220V_voltage</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.xcam_auto_recovery_step_loss)      != 0">xcam_auto_recovery_step_loss</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.camera_recording)                  != 0">camera_recording</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.ams_calibrate_remain_flag)         != 0">ams_calibrate_remain_flag</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.ams_auto_switch_filament_flag)     != 0">ams_auto_switch_filament_flag</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.xcam_allow_prompt_sound)           != 0">xcam_allow_prompt_sound</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_prompt_sound)           != 0">is_support_prompt_sound</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_filament_tangle_detect) != 0">is_support_filament_tangle_detect</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.xcam_filament_tangle_detect)       != 0">xcam_filament_tangle_detect</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_motor_noise_cali)       != 0">is_support_motor_noise_cali</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_user_preset)            != 0">is_support_user_preset</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.nozzle_blob_detection_enabled)     != 0">nozzle_blob_detection_enabled</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_nozzle_blob_detection)  != 0">is_support_nozzle_blob_detection</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.installed_plus)                    != 0">installed_plus</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.supported_plus)                    != 0">supported_plus</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.ams_air_print_status)              != 0">ams_air_print_status</div>
          <div v-if="(x1Client.Status.value.home_flag & HomeFlag.is_support_air_print_detection)    != 0">is_support_air_print_detection</div>
        </local-home-flag>
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
  grid-template-rows: auto auto auto auto auto auto auto auto 380px; /* TODO: How do I makle it fill the remaining space? */
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
