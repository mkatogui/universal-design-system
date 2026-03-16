<script setup lang="ts">
import { computed } from 'vue';

export interface DescriptionsItem {
  label: string;
  value: string;
}

export interface DescriptionsProps {
  /** Key-value pairs to display. */
  items: DescriptionsItem[];
  /** Layout variant. @default 'horizontal' */
  layout?: 'horizontal' | 'vertical' | 'bordered';
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<DescriptionsProps>(), {
  layout: 'horizontal',
  className: undefined,
});

const classes = computed(() =>
  ['uds-descriptions', `uds-descriptions--${props.layout}`, props.className]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <dl :class="classes">
    <template v-for="item in items" :key="String(item.label)">
      <dt class="uds-descriptions__label">{{ item.label }}</dt>
      <dd class="uds-descriptions__value">{{ item.value }}</dd>
    </template>
  </dl>
</template>
