<script setup lang="ts">
const props = defineProps({
  dataValue:  { type: Number,  required: true },
  dataMin:    { type: Number,  required: true },
  dataMax:    { type: Number,  required: true }
});
</script>
<template>
    <local-wrapper>
        <local-meter-wrapper-outer>
            <local-meter-wrapper-inner>
                <meter :value="props.dataValue" :min="props.dataMin" :max="props.dataMax"></meter>
            </local-meter-wrapper-inner>
        </local-meter-wrapper-outer>
        <local-temperature :data-value="props.dataValue"></local-temperature>
        <local-gradations></local-gradations>
    </local-wrapper>
</template>

<style scoped>
local-wrapper
{
    display: block;
    /*
    margin: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
*/
    /*
    --TM-mainTint: #3d3d44;
    --TM-backgroundColor: darken($TM-mainTint, 2%);
    --TM-borderSize: 9px;
    --TM-borderColor: darken($TM-mainTint, 8%);
    --TM-width: 25px;
    --TM-height: 240px;
    --TM-bulbSize: $TM-width * 2;
    --TM-radius: 20px;
    --TM-graduationsStyle: 2px solid rgba(0, 0, 0, 0.5);
    --TM-bulbColor: #3dcadf;
    --TM-mercuryColor : linear-gradient(#f17a65, $TM-bulbColor) no-repeat bottom;
*/
    /* Tooltip */
/*
    --TM-tooltipColor: rgba(0, 0, 0, 0.7);
    --TM-tooltipSize: 1em;
    --TM-tooltipRadius: 5px;
    --TM-tooltipTopShift: 5px;
    --TM-tooltipVerticalPadding: 5px;
    --TM-tooltipHorizontalPadding: calc(var(--TM-tooltipVerticalPadding) * 2);
    --TM-tooltipLeftShift: 100%;
    --TM-tooltipArrowWidth: 1.5; /* Higher numbers produce smaller width * - /
    --TM-tooltipArrowHeight: 2.2; /* Higher numbers produce smaller height * -/
*/
}

local-meter-wrapper-outer
{
    display: table;
}
local-meter-wrapper-inner
{
    display: block;
    padding: 50% 0;
    height: 0;
}
meter
{
    display: block;
    transform-origin: top left;
    transform: rotate(-90deg);
    margin-top: 50%;
}

local-thermometer
{
    display: block;

    /*
	width: var(--TM-width);
	background: var(--TM-backgroundColor);
	height: var(--TM-height);
	position: relative;

    border: var(--TM-borderSize) solid var(--TTM-borderColor);

	border-radius: var(--TM-radius);
	z-index: 1;
	margin-bottom: var(--TM-bulbSize);
*/
}

/*
local-thermometer:before, local-thermometer:after
{
    position: absolute;
    content: "";
    border-radius: 50%;
}
*/

/* Border cover */

/*
local-thermometer:before
{
    width: 100%;
    height: calc(var(--TM-bulbSize) / 2 + var(--TM-borderSize));
    bottom: var(--TM-borderSize);
    background: var(--TM-backgroundColor);
    z-index: -1;
}
*/
/* Bulb */
/*
local-thermometer:after
{
    transform: translateX(-50%);
    width: var(--TM-bulbSize);
    height: var(--TM-bulbSize);
    background-color: var(--TM-bulbColor);
    bottom: calc(-var(--TM-bulbSize) + var(--TM-borderSize));

    border: var(--TM-borderSize) solid var(--TTM-borderColor);

    z-index: -3;
    left: 50%;
}
*/
/*	
local-graduations
{
    display: block;

    height: 59%;
    top: 20%;
    width: 50%;
}

local-graduations,
local-graduations:before
{
    position: absolute;
    border-top: var(--TM-graduationsStyle);
    border-bottom: var(--TM-graduationsStyle);
}

local-graduations:before
{
    content: "";
    height: 34%;
    width: 100%;
    top: 32%;
}

local-temperature
{
    bottom: 0;
    background: var(--TM-mercuryColor);
    width: 100%;
    border-radius: var(--TM-radius);
    background-size: 100% var(--TM-height);
    transition: all 0.2s ease-in-out;
    
}
local-temperature,
local-temperature:before,
local-temperature:after
{
    position: absolute;
}
*/
/* Temperature value - Tooltip */
/*
local-temperature:before
{
    content: attr(data-value);
    background: var(--TM-tooltipColor);
    color: white;
    z-index: 2;
    padding: var(--TM-tooltipVerticalPadding) var(--TM-tooltipHorizontalPadding);
    border-radius: var(--TM-tooltipRadius);
    font-size: var(--TM-tooltipSize);
    line-height: 1;
    transform: translateY(50%);
    left: calc(var(--TM-tooltipLeftShift) + 1em / var(--TM-tooltipArrowWidth));
    top: calc(-1em + var(--TM-tooltipTopShift) - var(--TM-tooltipVerticalPadding) * 2);
}
*/
/* Tooltip arrow */
/*
local-temperature:after
{
    content: "";
    border-top: calc(var(--TM-tooltipSize) / var(--TM-tooltipArrowHeight)) solid transparent;
    border-bottom: calc(var(--TM-tooltipSize) / var(--TM-tooltipArrowHeight)) solid transparent;
    border-right: calc(var(--TM-tooltipSize) / var(--TM-tooltipArrowWidth)) solid var(--TM-tooltipColor);
    left: var(--TM-tooltipLeftShift);
    top: calc(var(--TM-tooltipSize) / var(--TM-tooltipArrowHeight) + var(--TM-tooltipTopShift));
}
*/
</style>
