<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  duration?: number
  action?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  size: 'md',
  duration: 5000,
})

const emit = defineEmits<{
  dismiss: []
  action: []
}>()

const visible = ref(true)

const classes = computed(() =>
  [
    'uds-toast',
    `uds-toast--${props.variant}`,
    `uds-toast--${props.size}`,
    visible.value && 'uds-toast--visible',
  ]
    .filter(Boolean)
    .join(' ')
)

const toastRole = computed(() =>
  props.variant === 'error' || props.variant === 'warning' ? 'alert' : 'status'
)

function dismiss() {
  visible.value = false
  emit('dismiss')
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(dismiss, props.duration)
  }
})
</script>

<template>
  <div v-if="visible" :class="classes" :role="toastRole">
    <p class="uds-toast__message">
      <slot>{{ message }}</slot>
    </p>
    <button
      v-if="action"
      class="uds-toast__action"
      @click="emit('action')"
    >
      {{ action }}
    </button>
    <button class="uds-toast__dismiss" aria-label="Dismiss notification" @click="dismiss">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
