<script setup lang="ts">
import { computed, ref } from 'vue'

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: unknown
}

interface Props {
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  iconOnly: false,
  disabled: false,
})

const emit = defineEmits<{
  change: [value: string]
}>()

const internalValue = ref(props.defaultValue ?? props.options[0]?.value ?? '')
const value = computed(() => props.value ?? internalValue.value)

const classes = computed(() =>
  [
    'uds-segmented-control',
    `uds-segmented-control--${props.size}`,
    props.iconOnly && 'uds-segmented-control--icon-only',
    props.disabled && 'uds-segmented-control--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

function select(optionValue: string) {
  if (props.disabled) return
  if (props.value === undefined) internalValue.value = optionValue
  emit('change', optionValue)
}

function handleKeydown(e: KeyboardEvent, currentIndex: number) {
  if (props.disabled) return
  let nextIndex = currentIndex
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    nextIndex = Math.max(0, currentIndex - 1)
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    nextIndex = Math.min(props.options.length - 1, currentIndex + 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    nextIndex = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    nextIndex = props.options.length - 1
  } else return
  const nextValue = props.options[nextIndex]?.value
  if (nextValue != null) select(nextValue)
}
</script>

<template>
  <div
    :class="classes"
    role="radiogroup"
    aria-label="Options"
    :aria-disabled="disabled"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="value === option.value"
      :disabled="disabled"
      :class="['uds-segmented-control__option', value === option.value && 'uds-segmented-control__option--selected'].filter(Boolean).join(' ')"
      @click="select(option.value)"
      @keydown="(e: KeyboardEvent) => handleKeydown(e, index)"
    >
      <span v-if="option.icon" class="uds-segmented-control__icon" aria-hidden="true"><slot name="icon" :option="option" /></span>
      <span v-if="!iconOnly" class="uds-segmented-control__label">{{ option.label }}</span>
    </button>
  </div>
</template>
