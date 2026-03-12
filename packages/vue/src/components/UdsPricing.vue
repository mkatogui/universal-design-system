<script setup lang="ts">
import { computed, ref } from 'vue'

interface Plan {
  name: string
  price: string
  annualPrice?: string
  features: string[]
  highlighted?: boolean
  cta?: string
}

interface Props {
  variant?: '2-column' | '3-column' | '4-column' | 'toggle'
  size?: 'standard' | 'compact'
  plans?: Plan[]
  highlightedPlan?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: '3-column',
  size: 'standard',
  plans: () => [],
})

const isAnnual = ref(false)

const classes = computed(() =>
  [
    'uds-pricing',
    `uds-pricing--${props.variant}`,
    `uds-pricing--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div :class="classes">
    <div v-if="variant === 'toggle'" class="uds-pricing__toggle">
      <span>Monthly</span>
      <button
        role="switch"
        :aria-checked="isAnnual"
        aria-label="Toggle annual pricing"
        class="uds-pricing__switch"
        @click="isAnnual = !isAnnual"
      >
        <span class="uds-pricing__switch-thumb" />
      </button>
      <span>Annual</span>
    </div>
    <div class="uds-pricing__plans">
      <slot :is-annual="isAnnual" />
    </div>
  </div>
</template>
