<template>
  <div :class="classes">
    <span v-if="label" class="uds-statistic__label">{{ label }}</span>
    <div class="uds-statistic__value">
      <span v-if="$slots.prefix" class="uds-statistic__prefix">
        <slot name="prefix" />
      </span>
      <span class="uds-statistic__number">
        <slot>{{ value }}</slot>
      </span>
      <span v-if="$slots.suffix" class="uds-statistic__suffix">
        <slot name="suffix" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface StatisticProps {
  value?: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<StatisticProps>(), {
  size: 'md',
});

const classes = computed(() =>
  ['uds-statistic', `uds-statistic--${props.size}`].join(' '),
);
</script>
