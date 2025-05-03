<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';


const props = defineProps({
  label:  { type: String,  required: false },
  isOn:   { type: Boolean, required: false, default: false }
});

const emit = defineEmits<{
  (e: 'toggle', isOn: boolean): void
}>()

const isOn : Ref<boolean> = ref(props.isOn);

watch (isOn, (newIsOn) =>
{
  emit("toggle", newIsOn);
})
</script>

<template>
  <local-toggle-switch>
    <local-label>{{ props.label }}</local-label>
    <local-toggle   :class="{on:    isOn, off:  isOn === false}" @click="isOn = !isOn">
      <local-switch :class="{right: isOn, left: isOn === false}"></local-switch>
    </local-toggle>
  </local-toggle-switch>
</template>

<style scoped>
local-toggle-switch
{
  display: flex;
  justify-content: space-between;
}

local-toggle
{
  margin-left: 1rem;
  display: inline-block;
  width: 2rem;
  height: 1rem;
  min-width: 2rem;
  min-height: 1rem;
  border-radius: 2rem;
  cursor: pointer;
  position: relative;
}

.off
{
  background-color: var(--color-off);
  transition: background-color 0.2s;
}

.on
{
  background-color: var(--color-on);
  transition: background-color 0.2s;
}

local-switch
{
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: var(--color-text);
  position: absolute;
  top: 0.05rem;
}

.left
{
  left: 0.05rem;
  transition: left 0.2s;
}
.right
{
  left: 1.15rem;
  transition: left 0.2s;
}
</style>
