<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea'
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'focus' | 'error' | 'disabled' | 'readonly'
  label?: string
  helperText?: string
  errorText?: string
  required?: boolean
  modelValue?: string | number
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  size: 'md',
  state: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = useId()
const helperId = useId()
const errorId = useId()

const classes = computed(() =>
  [
    'uds-input',
    `uds-input--${props.variant}`,
    `uds-input--${props.size}`,
    props.state === 'error' && 'uds-input--error',
    props.state === 'disabled' && 'uds-input--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.errorText) ids.push(errorId)
  if (props.helperText) ids.push(helperId)
  return ids.length ? ids.join(' ') : undefined
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="classes">
    <label v-if="label" :for="inputId" class="uds-input__label">
      {{ label }}
      <span v-if="required" class="uds-input__required" aria-hidden="true">*</span>
    </label>
    <textarea
      v-if="variant === 'textarea'"
      :id="inputId"
      class="uds-input__field uds-input__textarea"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="state === 'disabled'"
      :readonly="state === 'readonly'"
      :aria-invalid="state === 'error' || undefined"
      :aria-describedby="describedBy"
      @input="handleInput"
    />
    <input
      v-else
      :id="inputId"
      class="uds-input__field"
      :type="variant"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="state === 'disabled'"
      :readonly="state === 'readonly'"
      :aria-invalid="state === 'error' || undefined"
      :aria-describedby="describedBy"
      @input="handleInput"
    />
    <p v-if="errorText && state === 'error'" :id="errorId" class="uds-input__error" role="alert">
      {{ errorText }}
    </p>
    <p v-if="helperText" :id="helperId" class="uds-input__helper">
      {{ helperText }}
    </p>
  </div>
</template>
