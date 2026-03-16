<script setup lang="ts">
import { computed, ref, useId } from 'vue';

export interface CollapsibleProps {
  /** Controlled open state. @default false */
  open?: boolean;
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<CollapsibleProps>(), {
  open: false,
  className: undefined,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const internalOpen = ref(false);

// Use v-model:open pattern — if the parent binds v-model:open we act controlled
const isOpen = computed(() => props.open || internalOpen.value);

function toggle() {
  const next = !isOpen.value;
  internalOpen.value = next;
  emit('update:open', next);
}

const reactId = useId();
const contentId = computed(() => `${reactId}-content`);

const classes = computed(() =>
  ['uds-collapsible', props.className].filter(Boolean).join(' '),
);
</script>

<template>
  <div :class="classes">
    <button
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="contentId"
      class="uds-collapsible__trigger"
      @click="toggle"
    >
      <slot name="trigger" />
    </button>
    <section
      :id="contentId"
      class="uds-collapsible__content"
      :hidden="!isOpen"
      :aria-hidden="!isOpen"
    >
      <slot />
    </section>
  </div>
</template>
