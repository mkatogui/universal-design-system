<template>
  <span
    :class="classes"
    :style="colorStyle"
    :aria-hidden="decorative"
    v-bind="accessibleAttrs"
  >
    <slot>
      <span v-if="name" class="uds-icon__symbol">{{ name }}</span>
    </slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface IconProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  /** When true, sets aria-hidden (decorative). @default true */
  decorative?: boolean;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  decorative: true,
});

const classes = computed(() =>
  ['uds-icon', `uds-icon--${props.size}`].join(' '),
);

const colorStyle = computed(() =>
  props.color ? { color: props.color } : {},
);

const accessibleAttrs = computed(() =>
  props.decorative ? {} : { role: 'img', 'aria-label': props.name },
);
</script>
