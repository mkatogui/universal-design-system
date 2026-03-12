<script setup lang="ts">
import { computed } from 'vue'

interface Logo {
  src: string
  alt: string
}

interface Stat {
  value: string
  label: string
}

interface Props {
  variant?: 'logo-strip' | 'stats-counter' | 'testimonial-mini' | 'combined'
  size?: 'standard' | 'compact'
  logos?: Logo[]
  stats?: Stat[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'logo-strip',
  size: 'standard',
  logos: () => [],
  stats: () => [],
})

const classes = computed(() =>
  [
    'uds-social-proof',
    `uds-social-proof--${props.variant}`,
    `uds-social-proof--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div :class="classes">
    <div v-if="logos.length" class="uds-social-proof__logos">
      <img
        v-for="(logo, i) in logos"
        :key="i"
        :src="logo.src"
        :alt="logo.alt"
        class="uds-social-proof__logo"
      />
    </div>
    <div v-if="stats.length" class="uds-social-proof__stats">
      <div v-for="(stat, i) in stats" :key="i" class="uds-social-proof__stat">
        <span class="uds-social-proof__stat-value">{{ stat.value }}</span>
        <span class="uds-social-proof__stat-label">{{ stat.label }}</span>
      </div>
    </div>
    <slot />
  </div>
</template>
