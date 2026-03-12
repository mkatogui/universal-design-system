<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'icon-top' | 'image-top' | 'horizontal' | 'stat-card' | 'dashboard-preview'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  description?: string
  link?: string
  image?: string
  imageAlt?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'icon-top',
  size: 'md',
})

const classes = computed(() =>
  [
    'uds-card',
    `uds-card--${props.variant}`,
    `uds-card--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div :class="classes">
    <div v-if="image" class="uds-card__image">
      <img :src="image" :alt="imageAlt || ''" />
    </div>
    <div class="uds-card__icon">
      <slot name="icon" />
    </div>
    <div class="uds-card__body">
      <h3 v-if="title" class="uds-card__title">{{ title }}</h3>
      <p v-if="description" class="uds-card__description">{{ description }}</p>
      <slot />
    </div>
    <div v-if="link" class="uds-card__link">
      <a :href="link">
        <slot name="link-text">Learn more</slot>
      </a>
    </div>
  </div>
</template>
