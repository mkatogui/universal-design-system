<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  ariaLabel: string
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
})

const classes = computed(() =>
  [
    'uds-toolbar',
    props.orientation === 'vertical' && 'uds-toolbar--vertical',
    props.class,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div
    :class="classes"
    role="toolbar"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>
