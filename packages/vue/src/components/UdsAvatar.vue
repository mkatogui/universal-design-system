<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'image' | 'initials' | 'icon' | 'group'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  alt?: string
  initials?: string
  status?: 'online' | 'offline' | 'busy'
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'image',
  size: 'md',
})

const imgError = ref(false)

const classes = computed(() =>
  [
    'uds-avatar',
    `uds-avatar--${props.variant}`,
    `uds-avatar--${props.size}`,
    props.status && `uds-avatar--${props.status}`,
  ]
    .filter(Boolean)
    .join(' ')
)

function handleError() {
  imgError.value = true
}
</script>

<template>
  <div :class="classes">
    <img
      v-if="variant === 'image' && src && !imgError"
      :src="src"
      :alt="alt || ''"
      class="uds-avatar__image"
      @error="handleError"
    />
    <span v-else-if="variant === 'initials' || imgError" class="uds-avatar__initials" :aria-label="alt">
      {{ initials || fallback || '?' }}
    </span>
    <span v-else class="uds-avatar__icon" :aria-label="alt">
      <slot />
    </span>
    <span
      v-if="status"
      class="uds-avatar__status"
      :class="`uds-avatar__status--${status}`"
      :aria-label="status"
    />
  </div>
</template>
