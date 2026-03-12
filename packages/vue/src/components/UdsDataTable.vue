<script setup lang="ts">
import { computed, ref } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  variant?: 'basic' | 'sortable' | 'selectable' | 'expandable'
  density?: 'compact' | 'default' | 'comfortable'
  columns?: Column[]
  data?: Record<string, unknown>[]
  sortable?: boolean
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'basic',
  density: 'default',
  columns: () => [],
  data: () => [],
})

const emit = defineEmits<{
  sort: [key: string, direction: 'asc' | 'desc']
  select: [selectedRows: number[]]
}>()

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const selectedRows = ref<Set<number>>(new Set())

const classes = computed(() =>
  [
    'uds-data-table',
    `uds-data-table--${props.variant}`,
    `uds-data-table--${props.density}`,
  ]
    .filter(Boolean)
    .join(' ')
)

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  return [...props.data].sort((a, b) => {
    const aVal = String(a[sortKey.value] ?? '')
    const bVal = String(b[sortKey.value] ?? '')
    const cmp = aVal.localeCompare(bVal)
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function handleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  emit('sort', sortKey.value, sortDir.value)
}

function toggleRow(index: number) {
  const next = new Set(selectedRows.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  selectedRows.value = next
  emit('select', Array.from(next))
}

function toggleAll() {
  if (selectedRows.value.size === props.data.length) {
    selectedRows.value = new Set()
  } else {
    selectedRows.value = new Set(props.data.map((_, i) => i))
  }
  emit('select', Array.from(selectedRows.value))
}
</script>

<template>
  <div :class="classes">
    <table class="uds-data-table__table" role="table">
      <thead>
        <tr>
          <th v-if="selectable || variant === 'selectable'" class="uds-data-table__select-all">
            <input
              type="checkbox"
              :checked="selectedRows.size === data.length && data.length > 0"
              aria-label="Select all rows"
              @change="toggleAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
            :class="col.sortable || sortable ? 'uds-data-table__th--sortable' : ''"
          >
            <button
              v-if="col.sortable || sortable"
              class="uds-data-table__sort-btn"
              @click="handleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key" aria-hidden="true">
                {{ sortDir === 'asc' ? '&#9650;' : '&#9660;' }}
              </span>
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in sortedData" :key="i" :class="selectedRows.has(i) ? 'uds-data-table__row--selected' : ''">
          <td v-if="selectable || variant === 'selectable'">
            <input
              type="checkbox"
              :checked="selectedRows.has(i)"
              :aria-label="`Select row ${i + 1}`"
              @change="toggleRow(i)"
            />
          </td>
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.length === 0" class="uds-data-table__empty">
      <slot name="empty">No data available</slot>
    </div>
  </div>
</template>
