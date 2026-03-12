<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'simple' | 'multi-column' | 'newsletter' | 'mega-footer'
  size?: 'standard' | 'compact'
  copyright?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'simple',
  size: 'standard',
})

const classes = computed(() =>
  [
    'uds-footer',
    `uds-footer--${props.variant}`,
    `uds-footer--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <footer :class="classes" aria-label="Site footer">
    <nav class="uds-footer__columns" aria-label="Footer navigation">
      <slot />
    </nav>
    <div v-if="variant === 'newsletter'" class="uds-footer__newsletter">
      <slot name="newsletter" />
    </div>
    <div class="uds-footer__legal">
      <slot name="legal" />
      <p v-if="copyright" class="uds-footer__copyright">{{ copyright }}</p>
    </div>
  </footer>
</template>
