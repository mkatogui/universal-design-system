<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'status' | 'count' | 'tag'
  size?: 'sm' | 'md'
  label?: string
  color?: string
  removable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'status',
  size: 'md',
})

const emit = defineEmits<{
  remove: []
}>()

const classes = computed(() =>
  [
    'uds-badge',
    `uds-badge--${props.variant}`,
    `uds-badge--${props.size}`,
    props.color && `uds-badge--${props.color}`,
    props.removable && 'uds-badge--removable',
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <span :class="classes" :aria-label="label">
    <slot>{{ label }}</slot>
    <button
      v-if="removable"
      class="uds-badge__remove"
      :aria-label="`Remove ${label || ''}`"
      @click="emit('remove')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
