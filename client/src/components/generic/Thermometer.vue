<script setup lang="ts">

const props = defineProps({
  currentValue:  { type: Number,  required: true  },
  targetValue:   { type: Number,  required: false, default: NaN },
  valueMin:      { type: Number,  required: true  },
  valueMax:      { type: Number,  required: true  }
});

const  toPercentage = (value : number) =>
{
    return (value - props.valueMin) / (props.valueMax - props.valueMin) * 100;
}

const isIndicatorHidden = (value : number) =>
{
    return Number.isNaN(value) === true;
}

</script>
<template>
    <local-wrapper>
        <local-thermometer>
            <local-current :class="{hidden: isIndicatorHidden(props.currentValue)}" :style="{ '--valuenow': toPercentage(props.currentValue) + '%' }">{{ props.currentValue }}&deg;C</local-current>
            <local-bar                                                              :style="{ '--valuenow': toPercentage(props.currentValue) + '%' }"></local-bar>
            <local-target :class="{hidden: isIndicatorHidden(props.targetValue)}"   :style="{ '--valuenow': toPercentage(props.targetValue)  + '%' }">{{ props.targetValue  }}&deg;C</local-target>
        </local-thermometer>
    </local-wrapper>
</template>

<style scoped>
.hidden
{
    display: none;
}

local-wrapper
{
    --width:                  6rem;
    --height:                 5rem;
    --indicator-height:       1rem;
    --indicator-arrow-height: 2.0;
    --indicator-arrow-width:  1.5;
    --bar-width:              0.5rem;

    display:                  block;
    padding-top:              calc(var(--indicator-height) * 0.5);
    padding-bottom:           calc(var(--indicator-height) * 0.5);
}

local-thermometer
{
    display:  block;
    position: relative;
    width:    var(--width);
    height:   var(--height);
}

local-current
{
    position:     absolute;
    bottom:       calc(var(--valuenow));
    transform:    translateY(50%);
    background:   var(--color-border);

    padding-left: 0.25rem;;
    left:         0;
    width:        2rem;
}

local-target
{
    position:      absolute;
    bottom:        calc(var(--valuenow));
    transform:     translateY(50%);
    background:    var(--color-border);

    padding-right: 0.25rem;
    right:         0;
    width:         2rem;
}

local-current::after
{
    content:       "";
    border-top:    calc(var(--indicator-height) / var(--indicator-arrow-height)) solid transparent;
    border-bottom: calc(var(--indicator-height) / var(--indicator-arrow-height)) solid transparent;
    border-left:   calc(var(--indicator-height) / var(--indicator-arrow-width)) solid var(--color-border);
    position:      absolute;
    left:          100%;
    top:           calc(50% -  var(--indicator-height) / var(--indicator-arrow-height));
}

local-target::before
{
    content:       "";
    border-top:    calc(var(--indicator-height) / var(--indicator-arrow-height)) solid transparent;
    border-bottom: calc(var(--indicator-height) / var(--indicator-arrow-height)) solid transparent;
    border-right:  calc(var(--indicator-height) / var(--indicator-arrow-width)) solid var(--color-border);
    position:      absolute;
    right:         100%;
    top:           calc(50% -  var(--indicator-height) / var(--indicator-arrow-height));
}

local-bar
{
    position:      absolute;
    left:          calc(50% - (var(--bar-width) * 0.5));
    width:         var(--bar-width);
    height:        100%;
    border:        1px solid var(--color-border);
    border-radius: var(--bar-width);
    background:    linear-gradient(0deg, green 0%, yellow 50%, red 100%);
}

local-bar::after
{
    position:                absolute;
    left:                    0;
    right:                   0;
    top:                     0;

    content:                 '';
    border-top-left-radius:  var(--bar-width);
    border-top-right-radius: var(--bar-width);
    background:              var(--color-background);

    height:                  calc(100% - var(--valuenow));
}
</style>
