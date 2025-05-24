<script setup lang="ts">
import { inject, computed } from "vue";
import { type IBambuMonitorClient} from "@/plugins/IBambuMonitorClient";
import { LogLevel } from "../../../server/src/shared/LogLevel";

import StyledSelect from "./generic/StyledSelect.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const bambuMonitorClient = inject<IBambuMonitorClient>("BambuMonitorClient");
if (bambuMonitorClient === undefined)
{
  throw new Error ("[Header] Setup: No BambuMonitorClient plugin found.");
}

const LogLevelString = computed<string>(() => LogLevel[bambuMonitorClient.LogLevel.value]);
const LogLevels = computed(()=>Object.keys(LogLevel).filter(x => isNaN(Number(x)) === true));

const selectLogLevel = function (selected : string)
{
  const level : LogLevel = (<any>LogLevel)[selected];
  bambuMonitorClient.SetPrinterLogLevel(level);
}
</script>

<template>
  <div>
    <local-header>
      <img alt="Bambu Monitor logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
      <div>
        <h1>Bambu Monitor</h1>
        <div>Backend is {{ bambuMonitorClient.IsConnected.value === true ? "" : "not" }} connected</div>
        <div v-if="bambuMonitorClient.IsConnected.value">Printer is {{ bambuMonitorClient.IsPrinterConnected.value === true ? "" : "not" }} connected
          <local-log-level>
            Log level:
            <StyledSelect :options="LogLevels" :default="LogLevelString" @change="selectLogLevel"></StyledSelect>
          </local-log-level>
        </div>
      </div>
    </local-header>
    <nav>
        <RouterLink to="/">Status</RouterLink>
        <RouterLink to="/camera">Camera</RouterLink>
        <RouterLink to="/Handy">Handy</RouterLink>
        <RouterLink to="/History">History</RouterLink>
        <RouterLink to="/log">Log</RouterLink>
        <local-filler></local-filler>
    </nav>
  </div>
</template>

<style scoped>
local-header
{
  display: flex;
}

local-log-level
{
  padding-left: 2rem;
}

h1
{
  margin-top: -0.2em; /* TODO: This is sensitive to the font-family */
}

nav
{
  margin-top: 1rem;
  display: grid;
  grid-template-columns: auto auto auto auto auto 1fr;
}

nav > a
{
  border: 1px solid var(--color-border);
  border-radius: 0.3rem 0.3rem 0% 0%;
  color: var(--color-text-mute);
}

.router-link-active
{
  border-bottom: none;
  color: var(--color-text-highlight);
}

local-filler::after
{
  content: "";
  display: inline-block;
  width: 100%;
  height: 100%;
  border-bottom: 1px solid var(--color-border);
}
</style>
