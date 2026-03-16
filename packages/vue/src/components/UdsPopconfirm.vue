<template>
  <div :class="classes">
    <button
      ref="anchorRef"
      type="button"
      class="uds-popconfirm__trigger"
      @click="setOpen(true)"
    >
      <slot />
    </button>
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="uds-popconfirm__panel"
        role="dialog"
        aria-describedby="uds-popconfirm-desc"
        :style="panelStyle"
        @click.stop
        @keydown.stop
      >
        <p class="uds-popconfirm__title">{{ title }}</p>
        <p
          v-if="description"
          id="uds-popconfirm-desc"
          class="uds-popconfirm__description"
        >
          {{ description }}
        </p>
        <div class="uds-popconfirm__actions">
          <button
            type="button"
            class="uds-popconfirm__cancel"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="uds-popconfirm__confirm"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';

export interface PopconfirmProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  open?: boolean;
}

const props = withDefaults(defineProps<PopconfirmProps>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  'update:open': [value: boolean];
}>();

const anchorRef = ref<HTMLButtonElement | null>(null);
const internalOpen = ref(false);
const position = ref({ top: 0, left: 0 });

const isControlled = computed(() => props.open !== undefined);
const isOpen = computed(() =>
  isControlled.value ? props.open : internalOpen.value,
);

function setOpen(v: boolean) {
  if (!isControlled.value) {
    internalOpen.value = v;
  }
  emit('update:open', v);
}

const classes = computed(() => 'uds-popconfirm');

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}));

function handleConfirm() {
  emit('confirm');
  setOpen(false);
}

function handleCancel() {
  emit('cancel');
  setOpen(false);
}

function onDocumentClick() {
  setOpen(false);
}

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    if (anchorRef.value) {
      const rect = anchorRef.value.getBoundingClientRect();
      position.value = { top: rect.bottom + 8, left: rect.left };
    }
    document.addEventListener('click', onDocumentClick);
  } else {
    document.removeEventListener('click', onDocumentClick);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>
