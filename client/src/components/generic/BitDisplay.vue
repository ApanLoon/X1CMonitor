<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  bits:     { type: Number,  required: true },
  lsbFirst: { type: Boolean, required: false, default: false },
  minBits:  { type: Number,  required: false, default: 0     },
  vertical: { type: Boolean, required: false, default: false }
});

const bitEnabled = computed<Array<boolean>>(()=>
{
    let a = [];
    let v = props.bits;
    while (v > 0 || a.length < props.minBits)
    {
        if (props.lsbFirst === true)
        {
            a.push(v % 2 == 1); // append
        }
        else
        {
            a.unshift(v % 2 == 1); // prepend
        }
        v = Math.floor(v / 2);
    }
    return a;
});
</script>

<template>
    <local-container :class="{ 'vertical' : props.vertical }">
        <local-bit v-for="bit in bitEnabled" :class="{ 'on': bit }">&nbsp;</local-bit>
    </local-container>
</template>

<style scoped>

local-container
{
    display: flex;
    gap: 0.25rem;
    align-items: center;
}

.vertical
{
    flex-direction: column;
}

local-bit
{
    display: inline-block;
    background-color: var(--color-off);
    width: 0.5rem;
    height: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    box-sizing:content-box;
}

.on
{
    background-color: var(--color-on);
}
</style>