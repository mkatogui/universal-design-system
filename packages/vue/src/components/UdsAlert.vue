<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  message?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  size: 'md',
})

const emit = defineEmits<{
  dismiss: []
}>()

const dismissed = ref(false)

const classes = computed(() =>
  [
    'uds-alert',
    `uds-alert--${props.variant}`,
    `uds-alert--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)

const alertRole = computed(() =>
  props.variant === 'error' || props.variant === 'warning' ? 'alert' : 'status'
)

function handleDismiss() {
  dismissed.value = true
  emit('dismiss')
}
</script>

<template>
  <div v-if="!dismissed" :class="classes" :role="alertRole">
    <div class="uds-alert__content">
      <strong v-if="title" class="uds-alert__title">{{ title }}</strong>
      <p v-if="message" class="uds-alert__message">{{ message }}</p>
      <slot />
    </div>
    <button
      v-if="dismissible"
      class="uds-alert__dismiss"
      aria-label="Dismiss alert"
      @click="handleDismiss"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
