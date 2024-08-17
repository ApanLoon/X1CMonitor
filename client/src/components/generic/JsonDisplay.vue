<script setup lang="ts">
import { ref, type Ref } from 'vue';


const props = defineProps(
{
  data:     { type: Object,  required: true },
  rootName: { type: String}
});

const isPrimitive = (type : string) =>
{
    return    type === 'boolean'
           || type === 'number'
           || type === 'bigint'
           || type === 'string';
}

const shouldValueBeQuoted = (type : string) =>
{
    return type === 'string';
}

const quoteString = (value : string, shouldQuote? : boolean) =>
{
    return (shouldQuote === undefined || shouldQuote === true)
        ? `"${value}"`
        : value;
}

const isOpen : Ref<boolean> = ref(false);
</script>
<template>
    <local-json-display>
        <local-property>
            {{ rootName }}
            <template v-if="typeof props.data === 'object'">
                <button v-if="isOpen === true" :onClick="()=>isOpen = false">&#8743;</button>
                <button v-if="isOpen === false" :onClick="()=>isOpen = true">&#8744;</button>
            </template>
        </local-property>
        <local-container v-if="props.data !== undefined && props.data !== null" v-show="isOpen">
            <ul v-for="property in Object.keys(props.data)" :key="property">
                <li>
                    <template v-if="isPrimitive(typeof props.data[property])">
                        <local-property>{{ property }}</local-property>
                        :
                        <transition name="slide-fade" mode="out-in">
                            <local-value :key="props.data[property]">{{ quoteString(props.data[property], shouldValueBeQuoted(typeof props.data[property])) }}</local-value>
                        </transition>
                    </template>
                    <JsonDisplay v-if="typeof props.data[property] === 'object' && props.data[property] !== undefined && props.data[property] !== null" :data="props.data[property]" :rootName="property"></JsonDisplay>
                </li>
            </ul>
        </local-container>
    </local-json-display>
</template>

<style scoped>
local-json-display
{
    --color-property:   #1e40d6;
    --color-value-new:  black;
    --color-value-idle: #b34816;
}

@media (prefers-color-scheme: dark)
{
    local-json-display
    {
        --color-property:   #7CDCFE;
        --color-value-new:  white;
        --color-value-idle: #AC4C1F;
    }
}

local-container
{
    display: block;
}

ul
{
    list-style-type: none;
    padding-left: 1rem;
}

button
{
    border: none;
    background-color: transparent;
    color: var(--color-text);
    vertical-align: auto;
}

local-property
{
    color: var(--color-property);
}

local-value
{
    color: var(--color-value-idle);
}

.slide-fade-enter-from
{
    color: var(--color-value-new);
}

.slide-fade-enter-to
{
    transition: all 10s ease;
    color: var(--color-value-idle);
}
</style>
