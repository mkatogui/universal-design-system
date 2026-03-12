<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'numbered' | 'simple' | 'load-more' | 'infinite-scroll'
  size?: 'sm' | 'md'
  currentPage?: number
  totalPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'numbered',
  size: 'md',
  currentPage: 1,
  totalPages: 1,
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const classes = computed(() =>
  [
    'uds-pagination',
    `uds-pagination--${props.variant}`,
    `uds-pagination--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)

const pages = computed(() => {
  const result: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i)
  } else {
    result.push(1)
    if (current > 3) result.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) result.push(i)
    if (current < total - 2) result.push('...')
    result.push(total)
  }
  return result
})
</script>

<template>
  <nav :class="classes" aria-label="Pagination">
    <template v-if="variant === 'numbered' || variant === 'simple'">
      <button
        class="uds-pagination__prev"
        :disabled="currentPage <= 1"
        aria-label="Previous page"
        @click="emit('pageChange', currentPage - 1)"
      >
        Previous
      </button>
      <ol v-if="variant === 'numbered'" class="uds-pagination__list">
        <li v-for="(page, i) in pages" :key="i">
          <span v-if="page === '...'" class="uds-pagination__ellipsis">...</span>
          <button
            v-else
            class="uds-pagination__page"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="`Page ${page}`"
            @click="emit('pageChange', page as number)"
          >
            {{ page }}
          </button>
        </li>
      </ol>
      <button
        class="uds-pagination__next"
        :disabled="currentPage >= totalPages"
        aria-label="Next page"
        @click="emit('pageChange', currentPage + 1)"
      >
        Next
      </button>
    </template>
    <template v-if="variant === 'load-more'">
      <button
        class="uds-pagination__load-more"
        :disabled="currentPage >= totalPages"
        @click="emit('pageChange', currentPage + 1)"
      >
        <slot>Load more</slot>
      </button>
    </template>
  </nav>
</template>
