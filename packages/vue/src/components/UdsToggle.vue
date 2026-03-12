<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  variant?: 'standard' | 'with-label'
  checked?: boolean
  disabled?: boolean
  label?: string
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const toggleId = useId()

const classes = computed(() =>
  [
    'uds-toggle',
    `uds-toggle--${props.variant}`,
    props.disabled && 'uds-toggle--disabled',
    (props.modelValue ?? props.checked) && 'uds-toggle--on',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleClick() {
  if (props.disabled) return
  const next = !(props.modelValue ?? props.checked)
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <div :class="classes">
    <button
      :id="toggleId"
      type="button"
      role="switch"
      class="uds-toggle__track"
      :aria-checked="modelValue ?? checked ?? false"
      :aria-label="label"
      :disabled="disabled"
      @click="handleClick"
    >
      <span class="uds-toggle__thumb" aria-hidden="true" />
    </button>
    <label v-if="variant === 'with-label' && label" :for="toggleId" class="uds-toggle__label">
      {{ label }}
    </label>
  </div>
</template>
