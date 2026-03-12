<script setup lang="ts">
import { computed } from 'vue'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  variant?: 'standard' | 'truncated'
  items?: BreadcrumbItem[]
  separator?: string
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard',
  separator: '/',
  items: () => [],
})

const classes = computed(() =>
  [
    'uds-breadcrumb',
    `uds-breadcrumb--${props.variant}`,
  ]
    .filter(Boolean)
    .join(' ')
)

const displayItems = computed(() => {
  if (props.variant === 'truncated' && props.maxItems && props.items.length > props.maxItems) {
    const first = props.items.slice(0, 1)
    const last = props.items.slice(-(props.maxItems - 1))
    return [...first, { label: '...', href: undefined } as BreadcrumbItem, ...last]
  }
  return props.items
})
</script>

<template>
  <nav :class="classes" aria-label="Breadcrumb">
    <ol class="uds-breadcrumb__list">
      <li
        v-for="(item, i) in displayItems"
        :key="i"
        class="uds-breadcrumb__item"
      >
        <a
          v-if="item.href && i < displayItems.length - 1"
          :href="item.href"
          class="uds-breadcrumb__link"
        >
          {{ item.label }}
        </a>
        <span
          v-else
          class="uds-breadcrumb__current"
          :aria-current="i === displayItems.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="i < displayItems.length - 1"
          class="uds-breadcrumb__separator"
          aria-hidden="true"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>
