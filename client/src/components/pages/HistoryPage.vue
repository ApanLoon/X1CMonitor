<script lang="ts" setup>
import { inject, onMounted } from "vue";
import type { IX1Client } from "../../plugins/IX1Client";
import { JobState, type Job } from "../../../../server/src/shared/Job";

const x1Client = inject<IX1Client>("x1Client");
if (x1Client === undefined)
{
  throw new Error ("[HistoryPage] Setup: No x1Client plugin found.");
}

onMounted(()=>
{
    x1Client.RequestJobHistory();
});

function status(job : Job)
{
    switch (job.State)
    {
        case JobState.Failed:
            return "Failure";
        case JobState.Finished:
            return "Success";
        case JobState.Started:
            return "Pending";
        default:
            return "Unknown state";
    }
}

function duration (job : Job)
{
    if (job.StopTime == null )
    {
        return "?";
    }
    let diff = (job.StopTime.getTime() - job.StartTime.getTime()) / 1000 / 60; // Minutes
    if (diff < 60)
    {
        return `${round(diff, 2)} minutes`;
    }

    diff /= 60; // Hours
    if (diff < 24)
    {
        return `${round(diff, 2)} hours`;
    }

    diff /= 24; // Days
    return `${round(diff, 2)} days`;
}

function round(value: number, places : number)
{
    const multiplier = Math.pow(10, places);
    return (Math.round ((value + Number.EPSILON) * multiplier) / multiplier); 
}
</script>

<template>
  <local-container>
    <local-job v-for="job in x1Client.JobHistory.value">
        <img :src="job.Project?.ThumbnailFile" alt="Project Image" />
        <local-state :class="{
            success:    job.State === JobState.Finished,
            fail:     job.State === JobState.Failed
        }">{{ status(job) }}</local-state>
        <local-name>{{ job.Name }}</local-name>
        <local-duration>{{  duration(job) }}</local-duration>
        <local-plate>{{ job.Project?.PlateName }}</local-plate>
        <local-start>{{ job.StartTime.toLocaleString() }}</local-start>
    </local-job>
  </local-container>
</template>

<style scoped>
local-container
{
    justify-items: center;
}

.success
{
    background-color: var(--color-on);
}
.fail
{
    background-color: var(--color-error);
}

local-job
{
    display: grid;
    grid-template-areas: "img state    ."
                         "img name     name"
                         "img duration printer"
                         "img plate    start"
                         ;
    grid-template-columns: 20% auto auto;
    grid-template-rows: auto 1fr auto auto;

    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
    overflow: auto;
}

img
{
    grid-area: img;
    align-self: stretch;
    justify-self: stretch;
}

local-state
{
    grid-area: state;
    margin-left: 0;
    margin-right: auto;
    padding: 0 0.5rem;
    border-radius: 2rem;
    color: var(--color-text-highlight);
}
local-name
{
    grid-area: name;
    font-size: 1rem;
}
local-duration
{
    grid-area: duration;
}
local-printer
{
    grid-area: printer;
    justify-self: right;
}
local-plate
{
    grid-area: plate;
}
local-start
{
    grid-area: start;
    justify-self: right;
}
</style>
