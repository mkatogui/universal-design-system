<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick, Teleport } from 'vue';

export interface DrawerProps {
  /** Whether the drawer is currently visible. */
  open: boolean;
  /** Edge from which the drawer slides in. @default 'right' */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Width (left/right) or height (top/bottom) of the drawer. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Dialog heading rendered in the header. */
  title?: string;
  /** Additional CSS class for the drawer panel. */
  className?: string;
}

const props = withDefaults(defineProps<DrawerProps>(), {
  side: 'right',
  size: 'md',
  title: undefined,
  className: undefined,
});

const emit = defineEmits<{
  close: [];
}>();

const drawerRef = ref<HTMLDialogElement | null>(null);

const classes = computed(() =>
  ['uds-drawer', `uds-drawer--${props.side}`, `uds-drawer--${props.size}`, props.className]
    .filter(Boolean)
    .join(' '),
);

function handleOverlayClick(e: MouseEvent) {
  if (drawerRef.value && !drawerRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

watch(
  () => props.open,
  async (newVal) => {
    if (newVal) {
      document.addEventListener('keydown', handleKeyDown);
      await nextTick();
      // Auto-focus the first focusable element
      const focusable = drawerRef.value?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  },
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="uds-drawer-overlay" @mousedown="handleOverlayClick">
      <dialog
        ref="drawerRef"
        :class="classes"
        open
        aria-modal="true"
        :aria-label="title"
      >
        <div v-if="title" class="uds-drawer__header">
          <h2 class="uds-drawer__title">{{ title }}</h2>
          <button
            class="uds-drawer__close"
            type="button"
            aria-label="Close drawer"
            @click="emit('close')"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="uds-drawer__body">
          <slot />
        </div>
      </dialog>
    </div>
  </Teleport>
</template>
