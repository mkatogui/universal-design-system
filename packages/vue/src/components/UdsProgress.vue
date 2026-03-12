<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'bar' | 'circular' | 'stepper'
  size?: 'sm' | 'md' | 'lg'
  value?: number
  max?: number
  label?: string
  showValue?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'bar',
  size: 'md',
  value: 0,
  max: 100,
})

const classes = computed(() =>
  [
    'uds-progress',
    `uds-progress--${props.variant}`,
    `uds-progress--${props.size}`,
    props.indeterminate && 'uds-progress--indeterminate',
  ]
    .filter(Boolean)
    .join(' ')
)

const percentage = computed(() =>
  props.max > 0 ? Math.round((props.value / props.max) * 100) : 0
)

const circumference = computed(() => 2 * Math.PI * 40)
const strokeDashoffset = computed(() =>
  circumference.value - (percentage.value / 100) * circumference.value
)
</script>

<template>
  <div :class="classes">
    <div v-if="label" class="uds-progress__label">{{ label }}</div>

    <template v-if="variant === 'bar'">
      <div
        class="uds-progress__track"
        role="progressbar"
        :aria-valuenow="indeterminate ? undefined : value"
        :aria-valuemin="0"
        :aria-valuemax="max"
        :aria-label="label"
      >
        <div
          class="uds-progress__fill"
          :style="indeterminate ? {} : { width: `${percentage}%` }"
        />
      </div>
    </template>

    <template v-else-if="variant === 'circular'">
      <svg
        class="uds-progress__circle"
        viewBox="0 0 100 100"
        role="progressbar"
        :aria-valuenow="indeterminate ? undefined : value"
        :aria-valuemin="0"
        :aria-valuemax="max"
        :aria-label="label"
      >
        <circle class="uds-progress__circle-track" cx="50" cy="50" r="40" fill="none" stroke-width="8" />
        <circle
          class="uds-progress__circle-fill"
          cx="50" cy="50" r="40"
          fill="none" stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="indeterminate ? circumference * 0.75 : strokeDashoffset"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <template v-else-if="variant === 'stepper'">
      <div class="uds-progress__steps" role="progressbar" :aria-valuenow="value" :aria-valuemin="0" :aria-valuemax="max" :aria-label="label">
        <slot />
      </div>
    </template>

    <span v-if="showValue && !indeterminate" class="uds-progress__value">{{ percentage }}%</span>
  </div>
</template>
