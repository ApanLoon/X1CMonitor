<script setup lang="ts">

const props = defineProps(
{
  data:     { type: Object,  required: true }
});
</script>
<template>
    <local-container v-if="props.data !== undefined && props.data !== null">
        <ul v-for="property in Object.keys(props.data)" :key="property">
            <li>
                <local-property>{{ property }}</local-property>
                :
                <transition name="slide-fade" mode="out-in"
                            v-if="   typeof props.data[property] === 'boolean'
                                  || typeof props.data[property] === 'number'
                                  || typeof props.data[property] === 'bigint'">
                    <local-value :key="props.data[property]">{{ props.data[property] }}</local-value>
                </transition>
                <transition name="slide-fade" mode="out-in" v-if="   typeof props.data[property] === 'string'">
                    <local-value :key="props.data[property]">&quot;{{ props.data[property] }}&quot;</local-value>
                </transition>
                <JsonDisplay v-if="typeof props.data[property] === 'object' && props.data[property] !== undefined && props.data[property] !== null" :data="props.data[property]"></JsonDisplay>
            </li>
        </ul>
    </local-container>
</template>

<style scoped>
local-container
{
    display: block;

    --color-property:   #1e40d6;
    --color-value-new:  black;
    --color-value-idle: #b34816;
}

@media (prefers-color-scheme: dark)
{
    local-container
    {
        --color-property:   #7CDCFE;
        --color-value-new:  white;
        --color-value-idle: #AC4C1F;
    }
}

ul
{
    list-style-type: none;
    padding-left: 1rem;
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
