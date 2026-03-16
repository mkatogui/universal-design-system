<script setup lang="ts">
import { computed } from 'vue';

export interface ChipProps {
  /** Text content of the chip. */
  label: string;
  /** Visual variant. @default 'default' */
  variant?: 'default' | 'outlined' | 'removable';
  /** Chip size. @default 'md' */
  size?: 'sm' | 'md';
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'default',
  size: 'md',
  className: undefined,
});

const emit = defineEmits<{
  remove: [];
}>();

const hasRemoveListener = computed(() => {
  // Vue 3 does not expose listener check directly;
  // we rely on the parent binding @remove to trigger the emit.
  // The remove button is shown when variant is 'removable' or
  // when the consumer has bound a @remove handler (signaled via a prop).
  return props.variant === 'removable';
});

const classes = computed(() =>
  [
    'uds-chip',
    `uds-chip--${props.variant}`,
    `uds-chip--${props.size}`,
    hasRemoveListener.value && 'uds-chip--removable',
    props.className,
  ]
    .filter(Boolean)
    .join(' '),
);

const removeAriaLabel = computed(() => `Remove ${props.label}`);
</script>

<template>
  <span :class="classes" role="listitem">
    <span class="uds-chip__label">{{ label }}</span>
    <button
      v-if="hasRemoveListener"
      type="button"
      class="uds-chip__remove"
      :aria-label="removeAriaLabel"
      @click="emit('remove')"
    >
      &times;
    </button>
  </span>
</template>
