<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'code'

interface Props {
  variant?: Variant
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'body',
})

const tag = computed(() => {
  const map: Record<Variant, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    caption: 'span',
    code: 'code',
  }
  return map[props.variant]
})

const classes = computed(() =>
  ['uds-typography', `uds-typography--${props.variant}`, props.class].filter(Boolean).join(' ')
)
</script>

<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>
