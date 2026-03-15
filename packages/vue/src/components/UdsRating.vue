<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const classes = computed(() => ['uds-rating', `uds-rating--${props.size}`].filter(Boolean).join(' '))
</script>

<template>
  <div :class="classes" role="group" :aria-label="`Rating ${modelValue} of ${max}`">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      :class="['uds-rating__star', modelValue >= i && 'uds-rating__star--filled']"
      :aria-label="`${i} star${i > 1 ? 's' : ''}`"
      :disabled="disabled"
      @click="emit('update:modelValue', i)"
    >
      <span aria-hidden="true">{{ modelValue >= i ? '★' : '☆' }}</span>
    </button>
  </div>
</template>
