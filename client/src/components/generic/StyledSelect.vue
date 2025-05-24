<script setup lang="ts">

import { ref, type Ref } from "vue";

const props = defineProps(
{
  options:  { type: Array<string>,  required: true },
  default:  { type: String,         required: true },
  tabindex: { type: Number,         required: false, default: 0  }
});

const emit = defineEmits
<{
    (e: 'change', selected: string) : void
}>();

const isOpen : Ref<boolean> = ref(false);

</script>

<template>
    <local-select :tabIndex="tabindex" @blur="isOpen = false">
        <local-selected :class="{ open : isOpen }" @click="isOpen = !isOpen">
            {{ default }}
        </local-selected>

        <local-items :class="{ hide : !isOpen }">
            <local-item v-for="(option, i) of options"
                        :key="i"
                        @click="isOpen = false; emit('change', option);">
                {{ option }}
            </local-item>
        </local-items>
    </local-select>
</template>

<style scoped>
    local-select
    {
        position: relative;
        text-align: left;
        outline: none;
    }

    local-selected
    {
        background-color: transparent;
        color: var(--color-text);

        padding: 0px 1rem 0px 0.5rem;
        cursor: pointer;
        user-select: none;
    }

    /* "icon" */
    local-selected:after
    {
        content: "";
        position: absolute;
        top: 0.33rem;
        right: 0.25rem;

        border: 5px solid transparent;
        border-color: var(--color-text) transparent transparent transparent;
    }

    local-items
    {
        color: var(--color-text);
        border: 1px solid var(--color-border);
        background-color: var(--color-background);

        position: absolute;
        left: 0;
        top: 1rem;
        z-index: 1;
    }

    local-item
    {
        display: block;
        color: var(--color-text);
        padding: 0px 1em;
        cursor: pointer;
        user-select: none;
    }

    local-item:hover
    {
        color: var(--color-background);
        background-color: var(--color-text);
    }

    .hide
    {
        display: none;
    }
</style>
