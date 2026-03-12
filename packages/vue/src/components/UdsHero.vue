<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'centered' | 'product-screenshot' | 'video-bg' | 'gradient-mesh' | 'search-forward' | 'split'
  size?: 'full' | 'compact'
  headline?: string
  subheadline?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'centered',
  size: 'full',
})

const classes = computed(() =>
  [
    'uds-hero',
    `uds-hero--${props.variant}`,
    `uds-hero--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <section :class="classes">
    <div class="uds-hero__content">
      <h1 v-if="headline" class="uds-hero__headline">{{ headline }}</h1>
      <p v-if="subheadline" class="uds-hero__subheadline">{{ subheadline }}</p>
      <div class="uds-hero__cta">
        <slot name="cta" />
      </div>
      <div class="uds-hero__social-proof">
        <slot name="social-proof" />
      </div>
    </div>
    <div class="uds-hero__visual">
      <slot name="visual" />
    </div>
    <slot />
  </section>
</template>
