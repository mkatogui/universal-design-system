<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  size?: 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const classes = computed(() => ['uds-time-picker', `uds-time-picker--${props.size}`].filter(Boolean).join(' '))
</script>

<template>
  <input
    type="time"
    :value="modelValue"
    :class="classes"
    :disabled="disabled"
    aria-label="Time"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
