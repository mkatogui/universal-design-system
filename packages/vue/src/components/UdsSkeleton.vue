<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'text' | 'card' | 'avatar' | 'table'
  size?: 'sm' | 'md' | 'lg'
  lines?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  size: 'md',
  lines: 3,
  animated: true,
})

const classes = computed(() =>
  [
    'uds-skeleton',
    `uds-skeleton--${props.variant}`,
    `uds-skeleton--${props.size}`,
    props.animated && 'uds-skeleton--animated',
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div :class="classes" aria-busy="true" aria-hidden="true">
    <template v-if="variant === 'text'">
      <div v-for="i in lines" :key="i" class="uds-skeleton__line" />
    </template>
    <template v-else-if="variant === 'avatar'">
      <div class="uds-skeleton__circle" />
    </template>
    <template v-else-if="variant === 'card'">
      <div class="uds-skeleton__image" />
      <div class="uds-skeleton__line" />
      <div class="uds-skeleton__line uds-skeleton__line--short" />
    </template>
    <template v-else-if="variant === 'table'">
      <div v-for="i in lines" :key="i" class="uds-skeleton__row">
        <div class="uds-skeleton__cell" />
        <div class="uds-skeleton__cell" />
        <div class="uds-skeleton__cell" />
      </div>
    </template>
  </div>
</template>
