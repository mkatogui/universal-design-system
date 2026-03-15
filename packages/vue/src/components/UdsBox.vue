<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: string | number
  margin?: string | number
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() => ['uds-box', props.class].filter(Boolean).join(' '))

const style = computed(() => {
  const s: Record<string, string> = {}
  if (props.padding != null)
    s.padding = typeof props.padding === 'number' ? `${props.padding}px` : `var(--space-${props.padding}, ${props.padding})`
  if (props.margin != null)
    s.margin = typeof props.margin === 'number' ? `${props.margin}px` : `var(--space-${props.margin}, ${props.margin})`
  return s
})
</script>

<template>
  <div :class="classes" :style="style">
    <slot />
  </div>
</template>
