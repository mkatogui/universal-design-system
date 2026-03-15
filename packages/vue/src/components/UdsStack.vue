<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'row' | 'column'
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  wrap?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'column',
  gap: 'md',
  align: 'stretch',
  wrap: false,
})

const classes = computed(() =>
  [
    'uds-stack',
    `uds-stack--${props.direction}`,
    `uds-stack--gap-${props.gap}`,
    props.align !== 'stretch' && `uds-stack--align-${props.align}`,
    props.wrap && 'uds-stack--wrap',
    props.class,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
