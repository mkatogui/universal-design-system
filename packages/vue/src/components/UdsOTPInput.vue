<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  length?: 4 | 6
  value?: string
  defaultValue?: string
  autoFocus?: boolean
  inputMode?: 'numeric' | 'text'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 4,
  defaultValue: '',
  autoFocus: false,
  inputMode: 'numeric',
  disabled: false,
})

const emit = defineEmits<{
  change: [value: string]
}>()

const internalValue = ref(props.defaultValue.slice(0, props.length))
const value = computed(() => (props.value ?? internalValue.value).slice(0, props.length).padEnd(props.length, ''))

watch(() => props.value, (v) => { if (v !== undefined) internalValue.value = v.slice(0, props.length) })

const classes = computed(() =>
  ['uds-otp-input', props.disabled && 'uds-otp-input--disabled'].filter(Boolean).join(' ')
)

function setValue(next: string) {
  const s = next.slice(0, props.length)
  if (props.value === undefined) internalValue.value = s
  emit('change', s)
}

function handleChange(index: number, digit: string) {
  const char = props.inputMode === 'numeric' ? digit.replace(/\D/g, '').slice(-1) : digit.slice(-1)
  const arr = value.value.split('')
  arr[index] = char
  setValue(arr.join(''))
}

function handleKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && value.value[index] === '' && index > 0) {
    const inputs = document.querySelectorAll<HTMLInputElement>('.uds-otp-input__digit')
    inputs[index - 1]?.focus()
  }
}
</script>

<template>
  <div :class="classes" role="group" aria-label="One-time code">
    <input
      v-for="i in length"
      :key="i"
      type="text"
      :inputmode="inputMode"
      maxlength="1"
      autocomplete="one-time-code"
      :class="['uds-otp-input__digit']"
      :value="value[i - 1] ?? ''"
      :aria-label="`Digit ${i}`"
      :disabled="disabled"
      :autofocus="autoFocus && i === 1"
      @input="(e: Event) => handleChange(i - 1, (e.target as HTMLInputElement).value)"
      @keydown="(e: KeyboardEvent) => handleKeydown(e, i - 1)"
    />
  </div>
</template>
