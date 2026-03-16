<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  /**
   * Native input type. Use with multiline=false (default).
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  /** When true, renders a <textarea>; ignores type. @default false */
  multiline?: boolean
  /**
   * @deprecated Use `type` and `multiline` instead.
   * variant="textarea" → multiline; variant="email" etc. → type.
   */
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea'
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Visual label above the field. */
  label?: string
  /** Helper text below the field. */
  helperText?: string
  /** Error message below the field; sets aria-invalid. */
  errorText?: string
  /** When true, shows an asterisk on the label and sets aria-required. @default false */
  required?: boolean
  /** When true, shows "Optional" in the helper area and does not set required. */
  optional?: boolean
  /** Override for the "Optional" label when optional is true. @default 'Optional' */
  optionalLabel?: string
  /** Two-way bound value. */
  modelValue?: string | number
  /** Placeholder text. */
  placeholder?: string
  /** Disabled state. */
  disabled?: boolean
  /** Readonly state. */
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  multiline: false,
  size: 'md',
  required: false,
  optional: false,
  optionalLabel: 'Optional',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = useId()
const helperId = useId()
const errorId = useId()

const isTextarea = computed(() => Boolean(props.multiline || props.variant === 'textarea'))
const inputType = computed(() => {
  if (isTextarea.value) return 'text'
  return props.type ?? (props.variant as Props['type']) ?? 'text'
})
const isRequired = computed(() => props.required && !props.optional)

const classes = computed(() =>
  [
    'uds-input',
    `uds-input--${props.size}`,
    props.errorText && 'uds-input--error',
    props.disabled && 'uds-input--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

const describedBy = computed(() => {
  if (props.errorText) return errorId
  if (props.helperText || (props.optional && !props.helperText)) return helperId
  return undefined
})

const effectiveHelper = computed(() =>
  props.helperText ?? (props.optional && !props.errorText ? props.optionalLabel : undefined)
)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="classes">
    <label v-if="label" :for="inputId" class="uds-input__label">
      {{ label }}
      <span v-if="isRequired" class="uds-input__required" aria-hidden="true"> *</span>
    </label>
    <textarea
      v-if="isTextarea"
      :id="inputId"
      class="uds-input__field"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="!!errorText || undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired || undefined"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
    />
    <input
      v-else
      :id="inputId"
      class="uds-input__field"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="!!errorText || undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired || undefined"
      :required="isRequired || undefined"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
    />
    <p v-if="errorText" :id="errorId" class="uds-input__error" role="alert">
      {{ errorText }}
    </p>
    <p v-if="!errorText && effectiveHelper" :id="helperId" class="uds-input__helper">
      {{ effectiveHelper }}
    </p>
  </div>
</template>
