<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  variant?: 'standard' | 'indeterminate'
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  label?: string
  name?: string
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = useId()

const classes = computed(() =>
  [
    'uds-checkbox',
    `uds-checkbox--${props.variant}`,
    props.disabled && 'uds-checkbox--disabled',
    props.indeterminate && 'uds-checkbox--indeterminate',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div :class="classes">
    <input
      :id="checkboxId"
      type="checkbox"
      class="uds-checkbox__input"
      :checked="modelValue ?? checked"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :name="name"
      :aria-checked="indeterminate ? 'mixed' : undefined"
      @change="handleChange"
    />
    <label v-if="label" :for="checkboxId" class="uds-checkbox__label">{{ label }}</label>
  </div>
</template>
