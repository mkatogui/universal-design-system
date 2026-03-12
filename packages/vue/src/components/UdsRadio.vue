<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  variant?: 'standard' | 'card'
  checked?: boolean
  disabled?: boolean
  label?: string
  name?: string
  value?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const radioId = useId()

const classes = computed(() =>
  [
    'uds-radio',
    `uds-radio--${props.variant}`,
    props.disabled && 'uds-radio--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleChange() {
  if (props.value !== undefined) {
    emit('update:modelValue', props.value)
  }
}
</script>

<template>
  <div :class="classes">
    <input
      :id="radioId"
      type="radio"
      class="uds-radio__input"
      :checked="modelValue !== undefined ? modelValue === value : checked"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-checked="modelValue === value || checked || undefined"
      @change="handleChange"
    />
    <label v-if="label" :for="radioId" class="uds-radio__label">{{ label }}</label>
  </div>
</template>
