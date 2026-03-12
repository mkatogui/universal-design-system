<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'destructive' | 'icon-only'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  iconLeft?: boolean
  iconRight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const classes = computed(() =>
  [
    'uds-btn',
    `uds-btn--${props.variant}`,
    `uds-btn--${props.size}`,
    props.fullWidth && 'uds-btn--full-width',
    props.loading && 'uds-btn--loading',
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <button
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || undefined"
    role="button"
  >
    <span v-if="loading" class="uds-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
