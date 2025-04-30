<script lang="ts" setup>
import { inject } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[StatusPage] Setup: No x1Client plugin found.");
}
</script>

<template>
  <local-container>
    <template v-if="x1Client.IsConnected.value && x1Client.IsPrinterConnected.value && x1Client.Status.value !== undefined && x1Client.CurrentJob.value != null && x1Client.CurrentJob.value.Project != null ">
        <img :src="x1Client.CurrentJob.value.Project?.ThumbnailFile" alt="Project Image" />
        <local-itemised-list>
          <local-item-name>Plate</local-item-name> <local-item-value>{{ x1Client.CurrentJob.value.Project.PlateName }} (Index: {{ x1Client.CurrentJob.value.Project.PlateIndex }})</local-item-value>
          <local-item-name>Profile</local-item-name> <local-item-value>{{ x1Client.CurrentJob.value.Project.SettingsName }}</local-item-value>
          <local-item-name>Total filament weight</local-item-name> <local-item-value>{{ x1Client.CurrentJob.value.Project.TotalWeight }}g</local-item-value>
        </local-itemised-list>

        <div v-for="filament in x1Client.CurrentJob.value.Project.Filaments">
          <local-filament :style="{'background-color': filament.Colour}">
            <local-filament-text>
              <div>{{ filament.Type }}</div>
              <div>{{ filament.UsedLength }}m</div>
              <div>{{ filament.UsedWeight }}g</div>
            </local-filament-text>
          </local-filament>
        </div>
    </template>
  </local-container>
</template>

<style scoped>
local-container
{
  justify-items: center;
}
local-box
{
  display: block;
  border: 1px solid var(--color-border);
  overflow: auto;
}

img
{
  display: block;
  width: 90%;
  justify-self: center;
}

local-itemised-list
{
  display: grid;
  grid-template-columns: 1fr 1fr;
}
local-item-name
{
  justify-self: left;
}
local-item-value
{
  justify-self: right;
}

local-filament
{
  display: inline-block;
  border: 1px solid var(--color-border);
  padding: 1rem;
}
local-filament-text
{
    color: white;
    filter:  brightness(.7);
    mix-blend-mode: difference;
    text-align: center;
}
</style>
