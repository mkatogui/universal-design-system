<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  open?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  size?: 'sm' | 'md'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  size: 'md',
})

const emit = defineEmits<{
  'open-change': [open: boolean]
}>()

const internalOpen = ref(false)
const open = computed(() => props.open ?? internalOpen.value)

const contentRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const contentStyle = ref<Record<string, string>>({ position: 'fixed', left: '0', top: '0', zIndex: '9999' })

watch(open, (isOpen) => {
  if (isOpen && triggerRef.value && contentRef.value) {
    requestAnimationFrame(() => {
      if (!triggerRef.value || !contentRef.value) return
      const tr = triggerRef.value.getBoundingClientRect()
      const cr = contentRef.value.getBoundingClientRect()
      let top = tr.bottom + 8
      let left = tr.left + (tr.width - cr.width) / 2
      if (props.placement === 'top') {
        top = tr.top - cr.height - 8
      }
      left = Math.max(8, Math.min(window.innerWidth - cr.width - 8, left))
      top = Math.max(8, Math.min(window.innerHeight - cr.height - 8, top))
      contentStyle.value = { position: 'fixed', left: `${left}px`, top: `${top}px`, zIndex: '9999' }
    })
  }
})

const classes = computed(() =>
  ['uds-popover', `uds-popover--${props.size}`, `uds-popover--${props.placement}`, props.class].filter(Boolean).join(' ')
)

function setOpen(v: boolean) {
  if (props.open === undefined) internalOpen.value = v
  emit('open-change', v)
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') setOpen(false)
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', handleEscape)
  else document.removeEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="uds-popover__wrapper">
    <div ref="triggerRef" @click="setOpen(!open)">
      <slot name="trigger" :open="open" />
    </div>
    <Teleport to="body">
      <div
        v-if="open"
        ref="contentRef"
        :class="classes"
        role="dialog"
        aria-modal="false"
        :style="contentStyle"
      >
        <div class="uds-popover__content">
          <slot />
        </div>
      </div>
    </Teleport>
  </div>
</template>
