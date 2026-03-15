<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  columns?: 1 | 2 | 3 | 4 | 12
  gap?: 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  columns: 1,
  gap: 'md',
})

const classes = computed(() =>
  ['uds-grid', `uds-grid--cols-${props.columns}`, `uds-grid--gap-${props.gap}`, props.class].filter(Boolean).join(' ')
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
