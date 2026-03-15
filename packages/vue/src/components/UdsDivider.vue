<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'line' | 'dashed'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'line',
})

const classes = computed(() =>
  [
    'uds-divider',
    `uds-divider--${props.orientation}`,
    props.variant === 'dashed' && 'uds-divider--dashed',
    props.class,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <hr :class="classes" role="separator" />
</template>
