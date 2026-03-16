<script setup lang="ts">
import { computed } from 'vue';

export interface EmptyProps {
  /** Heading text. @default 'No data' */
  title?: string;
  /** Descriptive text below the heading. */
  description?: string;
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<EmptyProps>(), {
  title: 'No data',
  description: undefined,
  className: undefined,
});

const classes = computed(() =>
  ['uds-empty', props.className].filter(Boolean).join(' '),
);
</script>

<template>
  <output :class="classes" :aria-label="title" for="">
    <div v-if="$slots.illustration" class="uds-empty__illustration">
      <slot name="illustration" />
    </div>
    <h3 class="uds-empty__title">{{ title }}</h3>
    <p v-if="description" class="uds-empty__description">{{ description }}</p>
    <div v-if="$slots.action" class="uds-empty__action">
      <slot name="action" />
    </div>
  </output>
</template>
