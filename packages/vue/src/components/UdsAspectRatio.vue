<script setup lang="ts">
import { computed } from 'vue';

export interface AspectRatioProps {
  /** Aspect ratio value. @default '16/9' */
  ratio?: '16/9' | '1/1' | '4/3';
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<AspectRatioProps>(), {
  ratio: '16/9',
  className: undefined,
});

const classes = computed(() =>
  ['uds-aspect-ratio', `uds-aspect-ratio--${props.ratio.replace('/', '-')}`, props.className]
    .filter(Boolean)
    .join(' '),
);

const style = computed(() => ({ aspectRatio: props.ratio }));
</script>

<template>
  <div :class="classes" :style="style">
    <slot />
  </div>
</template>
