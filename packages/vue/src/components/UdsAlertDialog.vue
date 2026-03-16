<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, useId, nextTick, Teleport } from 'vue';

export interface AlertDialogProps {
  /** Whether the alert dialog is currently visible. */
  open: boolean;
  /** Visual variant indicating severity. @default 'info' */
  variant?: 'info' | 'warning' | 'destructive';
  /** Dialog heading. */
  title: string;
  /** Descriptive message explaining the action. */
  description: string;
  /** Label for the confirm button. @default 'Confirm' */
  confirmLabel?: string;
  /** Label for the cancel button. @default 'Cancel' */
  cancelLabel?: string;
  /** Additional CSS class for the dialog panel. */
  className?: string;
}

const props = withDefaults(defineProps<AlertDialogProps>(), {
  variant: 'info',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  className: undefined,
});

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const dialogRef = ref<HTMLDivElement | null>(null);
const cancelRef = ref<HTMLButtonElement | null>(null);

const reactId = useId();
const titleId = computed(() => `uds-alert-dialog-title-${reactId}`);
const descId = computed(() => `uds-alert-dialog-desc-${reactId}`);

const classes = computed(() =>
  ['uds-alert-dialog', `uds-alert-dialog--${props.variant}`, props.className]
    .filter(Boolean)
    .join(' '),
);

const confirmBtnClass = computed(() =>
  `uds-btn uds-btn--${props.variant === 'destructive' ? 'destructive' : 'primary'} uds-btn--md`,
);

function handleConfirm() {
  emit('confirm');
  emit('close');
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

function handleOverlayClick(e: MouseEvent) {
  if (dialogRef.value && !dialogRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

watch(
  () => props.open,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      cancelRef.value?.focus();
      document.addEventListener('keydown', handleKeyDown);
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
    <div v-if="open" class="uds-alert-dialog-overlay" @mousedown="handleOverlayClick">
      <div
        ref="dialogRef"
        :class="classes"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
      >
        <div class="uds-alert-dialog__header">
          <h2 :id="titleId" class="uds-alert-dialog__title">
            {{ title }}
          </h2>
        </div>
        <div class="uds-alert-dialog__body">
          <p :id="descId" class="uds-alert-dialog__description">
            {{ description }}
          </p>
        </div>
        <div class="uds-alert-dialog__footer">
          <button
            ref="cancelRef"
            class="uds-btn uds-btn--secondary uds-btn--md"
            type="button"
            @click="emit('close')"
          >
            {{ cancelLabel }}
          </button>
          <button
            :class="confirmBtnClass"
            type="button"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
