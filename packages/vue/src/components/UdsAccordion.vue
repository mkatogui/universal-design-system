<script setup lang="ts">
import { computed, ref } from 'vue'

interface AccordionItem {
  title: string
  content?: string
  defaultExpanded?: boolean
}

interface Props {
  variant?: 'single' | 'multi' | 'flush'
  items?: AccordionItem[]
  allowMultiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'single',
  items: () => [],
})

const expandedItems = ref<Set<number>>(
  new Set(props.items.map((item, i) => (item.defaultExpanded ? i : -1)).filter((i) => i >= 0))
)

const classes = computed(() =>
  [
    'uds-accordion',
    `uds-accordion--${props.variant}`,
  ]
    .filter(Boolean)
    .join(' ')
)

function toggle(index: number) {
  const next = new Set(expandedItems.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    if (!props.allowMultiple && props.variant === 'single') {
      next.clear()
    }
    next.add(index)
  }
  expandedItems.value = next
}

function handleKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle(index)
  }
}
</script>

<template>
  <div :class="classes">
    <div v-for="(item, i) in items" :key="i" class="uds-accordion__item">
      <button
        class="uds-accordion__trigger"
        :aria-expanded="expandedItems.has(i)"
        :aria-controls="`accordion-panel-${i}`"
        @click="toggle(i)"
        @keydown="handleKeydown($event, i)"
      >
        <span class="uds-accordion__title">{{ item.title }}</span>
        <span class="uds-accordion__icon" aria-hidden="true" />
      </button>
      <div
        :id="`accordion-panel-${i}`"
        class="uds-accordion__panel"
        role="region"
        :hidden="!expandedItems.has(i)"
      >
        <div class="uds-accordion__content">
          <slot :name="`item-${i}`">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
