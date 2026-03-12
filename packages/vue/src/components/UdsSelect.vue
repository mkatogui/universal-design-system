<script setup lang="ts">
import { computed, useId } from 'vue'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  variant?: 'native' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  options?: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  state?: 'default' | 'focus' | 'error' | 'disabled'
  label?: string
  helperText?: string
  errorText?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'native',
  size: 'md',
  state: 'default',
  options: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectId = useId()
const errorId = useId()

const classes = computed(() =>
  [
    'uds-select',
    `uds-select--${props.variant}`,
    `uds-select--${props.size}`,
    props.state === 'error' && 'uds-select--error',
    props.disabled && 'uds-select--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="classes">
    <label v-if="label" :for="selectId" class="uds-select__label">{{ label }}</label>
    <select
      :id="selectId"
      class="uds-select__field"
      :value="modelValue"
      :required="required"
      :disabled="disabled || state === 'disabled'"
      :aria-invalid="state === 'error' || undefined"
      :aria-describedby="errorText ? errorId : undefined"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </select>
    <p v-if="errorText && state === 'error'" :id="errorId" class="uds-select__error" role="alert">
      {{ errorText }}
    </p>
    <p v-if="helperText" class="uds-select__helper">{{ helperText }}</p>
  </div>
</template>
