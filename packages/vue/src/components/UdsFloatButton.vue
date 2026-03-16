<template>
  <button
    ref="buttonRef"
    type="button"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface FloatButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'primary' | 'extended';
  size?: 'md' | 'lg';
  ariaLabel: string;
}

const props = withDefaults(defineProps<FloatButtonProps>(), {
  position: 'bottom-right',
  variant: 'primary',
  size: 'md',
});

const buttonRef = ref<HTMLButtonElement | null>(null);

const classes = computed(() =>
  [
    'uds-float-button',
    `uds-float-button--${props.position}`,
    `uds-float-button--${props.variant}`,
    `uds-float-button--${props.size}`,
  ].join(' '),
);

defineExpose({ el: buttonRef });
</script>
