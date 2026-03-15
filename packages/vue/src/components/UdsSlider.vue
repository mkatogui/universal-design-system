<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const value = computed(() => props.modelValue ?? props.min)
const classes = computed(() => ['uds-slider', `uds-slider--${props.size}`].filter(Boolean).join(' '))
</script>

<template>
  <div :class="classes">
    <input
      type="range"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="value"
      class="uds-slider__input"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    >
  </div>
</template>
