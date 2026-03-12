<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'standard' | 'minimal' | 'dark' | 'transparent'
  sticky?: boolean
  blurOnScroll?: boolean
  megaMenu?: boolean
  darkModeToggle?: boolean
  ctaButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
})

const mobileOpen = ref(false)

const classes = computed(() =>
  [
    'uds-navbar',
    `uds-navbar--${props.variant}`,
    props.sticky && 'uds-navbar--sticky',
    mobileOpen.value && 'uds-navbar--mobile-open',
  ]
    .filter(Boolean)
    .join(' ')
)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
</script>

<template>
  <nav :class="classes" aria-label="Main navigation">
    <div class="uds-navbar__brand">
      <slot name="brand" />
    </div>
    <button
      class="uds-navbar__toggle"
      :aria-expanded="mobileOpen"
      aria-label="Toggle navigation menu"
      @click="toggleMobile"
    >
      <slot name="toggle-icon">
        <span class="uds-navbar__hamburger" aria-hidden="true" />
      </slot>
    </button>
    <div class="uds-navbar__menu" :hidden="!mobileOpen && undefined">
      <slot />
    </div>
    <div v-if="ctaButton" class="uds-navbar__cta">
      <slot name="cta" />
    </div>
  </nav>
</template>
