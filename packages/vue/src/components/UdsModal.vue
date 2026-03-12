<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick } from 'vue'

interface Props {
  variant?: 'confirmation' | 'task' | 'alert'
  size?: 'sm' | 'md' | 'lg'
  open?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'confirmation',
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

const modalRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

const classes = computed(() =>
  [
    'uds-modal',
    `uds-modal--${props.variant}`,
    `uds-modal--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)

function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  )
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key === 'Tab') {
    const focusable = getFocusableElements()
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    previousFocus = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    const focusable = getFocusableElements()
    if (focusable.length) focusable[0].focus()
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeydown)
    previousFocus?.focus()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="uds-modal-overlay" role="presentation" @click="handleOverlayClick">
      <div
        ref="modalRef"
        :class="classes"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div v-if="title" class="uds-modal__header">
          <h2 class="uds-modal__title">{{ title }}</h2>
          <button class="uds-modal__close" aria-label="Close dialog" @click="emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="uds-modal__body">
          <slot />
        </div>
        <div class="uds-modal__footer">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
