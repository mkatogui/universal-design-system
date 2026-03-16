<template>
  <div ref="rootRef" :class="classes" v-bind="$attrs">
    <component :is="titleTag" class="uds-form-section__title">{{ title }}</component>
    <p v-if="description" class="uds-form-section__description">{{ description }}</p>
    <div v-if="$slots.default" class="uds-form-section__fields">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface FormSectionProps {
  /** Section heading (e.g. "Contact details", "Payment"). */
  title: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Heading level for the title. @default 2 */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const props = withDefaults(defineProps<FormSectionProps>(), {
  titleLevel: 2,
});

const rootRef = ref<HTMLDivElement | null>(null);

const titleTag = computed(() => `h${props.titleLevel}`);

const classes = computed(() => 'uds-form-section');

defineExpose({ el: rootRef });
</script>
