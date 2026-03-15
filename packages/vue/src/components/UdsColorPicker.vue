<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  showHexInput?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#000000',
  showHexInput: true,
})

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const id = 'uds-color-picker-' + Math.random().toString(36).slice(2, 9)
const classes = computed(() => ['uds-color-picker'].filter(Boolean).join(' '))
</script>

<template>
  <div :class="classes">
    <label v-if="label" :for="id" class="uds-color-picker__label">{{ label }}</label>
    <div class="uds-color-picker__row">
      <input
        :id="id"
        type="color"
        :value="modelValue"
        :disabled="disabled"
        class="uds-color-picker__swatch"
        :aria-describedby="showHexInput ? `${id}-hex` : undefined"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <input
        v-if="showHexInput"
        :id="`${id}-hex`"
        type="text"
        :value="modelValue"
        :disabled="disabled"
        class="uds-color-picker__hex"
        aria-label="Hex color"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>
