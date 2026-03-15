<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  href: string
  variant?: 'default' | 'muted' | 'primary'
  external?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  external: false,
})

const classes = computed(() =>
  ['uds-link', `uds-link--${props.variant}`, props.class].filter(Boolean).join(' ')
)

const rel = computed(() => (props.external ? 'noopener noreferrer' : undefined))
const target = computed(() => (props.external ? '_blank' : undefined))
</script>

<template>
  <a :class="classes" :href="href" :rel="rel" :target="target">
    <slot />
  </a>
</template>
