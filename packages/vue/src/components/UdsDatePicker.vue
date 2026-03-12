<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface Props {
  variant?: 'single' | 'range' | 'with-time'
  size?: 'md' | 'lg'
  modelValue?: string
  min?: string
  max?: string
  disabled?: boolean
  label?: string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'single',
  size: 'md',
  locale: 'en-US',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const inputId = useId()

const classes = computed(() =>
  [
    'uds-date-picker',
    `uds-date-picker--${props.variant}`,
    `uds-date-picker--${props.size}`,
    isOpen.value && 'uds-date-picker--open',
    props.disabled && 'uds-date-picker--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

const inputType = computed(() => {
  if (props.variant === 'with-time') return 'datetime-local'
  return 'date'
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="classes">
    <label v-if="label" :for="inputId" class="uds-date-picker__label">{{ label }}</label>
    <input
      :id="inputId"
      class="uds-date-picker__input"
      :type="inputType"
      :value="modelValue"
      :min="min"
      :max="max"
      :disabled="disabled"
      :aria-label="label || 'Select date'"
      role="grid"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="isOpen = false"
    />
  </div>
</template>
