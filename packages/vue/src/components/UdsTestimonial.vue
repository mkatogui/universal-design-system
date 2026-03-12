<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'quote-card' | 'video' | 'metric' | 'carousel'
  size?: 'sm' | 'md' | 'lg'
  quote?: string
  name?: string
  title?: string
  company?: string
  avatar?: string
  rating?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'quote-card',
  size: 'md',
})

const classes = computed(() =>
  [
    'uds-testimonial',
    `uds-testimonial--${props.variant}`,
    `uds-testimonial--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <figure :class="classes">
    <blockquote v-if="quote" class="uds-testimonial__quote">
      <p>{{ quote }}</p>
    </blockquote>
    <slot />
    <figcaption class="uds-testimonial__attribution">
      <img
        v-if="avatar"
        :src="avatar"
        :alt="`Photo of ${name || ''}`"
        class="uds-testimonial__avatar"
      />
      <div class="uds-testimonial__info">
        <cite v-if="name" class="uds-testimonial__name">{{ name }}</cite>
        <span v-if="title || company" class="uds-testimonial__role">
          {{ [title, company].filter(Boolean).join(', ') }}
        </span>
      </div>
      <div v-if="rating" class="uds-testimonial__rating" :aria-label="`${rating} out of 5 stars`">
        <span v-for="i in 5" :key="i" :class="i <= rating ? 'uds-testimonial__star--filled' : 'uds-testimonial__star'" aria-hidden="true">
          &#9733;
        </span>
      </div>
    </figcaption>
  </figure>
</template>
