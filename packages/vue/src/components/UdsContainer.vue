<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'full'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
})

const classes = computed(() =>
  ['uds-container', `uds-container--${props.size}`, props.class].filter(Boolean).join(' ')
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
