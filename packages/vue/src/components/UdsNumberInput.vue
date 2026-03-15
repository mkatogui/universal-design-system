<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number | string
  min?: number
  max?: number
  step?: number
  showStepper?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  showStepper: false,
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [v: number | string] }>()

const classes = computed(() =>
  [
    'uds-number-input',
    `uds-number-input--${props.size}`,
    props.showStepper && 'uds-number-input--stepper',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleStep(delta: number) {
  const next = (Number(props.modelValue) || 0) + delta
  const clamped =
    props.min != null && next < props.min ? props.min : props.max != null && next > props.max ? props.max : next
  emit('update:modelValue', clamped)
}
</script>

<template>
  <div :class="classes">
    <button
      v-if="showStepper"
      type="button"
      class="uds-number-input__stepper uds-number-input__stepper--minus"
      aria-label="Decrease"
      :disabled="disabled || (min != null && Number(modelValue) <= min)"
      @click="handleStep(-step)"
    >
      −
    </button>
    <input
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="uds-number-input__input"
      :aria-valuenow="modelValue != null ? Number(modelValue) : undefined"
      :aria-valuemin="min"
      :aria-valuemax="max"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      v-if="showStepper"
      type="button"
      class="uds-number-input__stepper uds-number-input__stepper--plus"
      aria-label="Increase"
      :disabled="disabled || (max != null && Number(modelValue) >= max)"
      @click="handleStep(step)"
    >
      +
    </button>
  </div>
</template>
