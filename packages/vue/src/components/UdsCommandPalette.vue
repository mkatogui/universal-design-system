<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick, useId } from 'vue'

interface Action {
  id: string
  label: string
  group?: string
  shortcut?: string
}

interface Props {
  open?: boolean
  actions?: Action[]
  placeholder?: string
  groups?: string[]
  recentLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  placeholder: 'Type a command...',
  groups: () => [],
  recentLimit: 5,
})

const emit = defineEmits<{
  select: [action: Action]
  close: []
}>()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listId = useId()

const classes = computed(() =>
  [
    'uds-command-palette',
    props.open && 'uds-command-palette--open',
  ]
    .filter(Boolean)
    .join(' ')
)

const filteredActions = computed(() => {
  if (!query.value) return props.actions
  const q = query.value.toLowerCase()
  return props.actions.filter((a) => a.label.toLowerCase().includes(q))
})

function selectAction(action: Action) {
  emit('select', action)
  query.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % filteredActions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + filteredActions.value.length) % filteredActions.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (filteredActions.value[activeIndex.value]) {
      selectAction(filteredActions.value[activeIndex.value])
    }
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (!props.open) {
      // Parent controls open state
    } else {
      emit('close')
    }
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    inputRef.value?.focus()
    activeIndex.value = 0
  }
})

watch(query, () => {
  activeIndex.value = 0
})

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="uds-command-palette-overlay" role="presentation" @click.self="emit('close')">
      <div :class="classes" role="combobox" aria-expanded="true" :aria-owns="listId">
        <div class="uds-command-palette__input-wrapper">
          <input
            ref="inputRef"
            v-model="query"
            class="uds-command-palette__input"
            :placeholder="placeholder"
            role="searchbox"
            aria-autocomplete="list"
            :aria-controls="listId"
            :aria-activedescendant="filteredActions.length ? `cmd-item-${activeIndex}` : undefined"
            @keydown="handleKeydown"
          />
        </div>
        <ul :id="listId" class="uds-command-palette__list" role="listbox">
          <li
            v-for="(action, i) in filteredActions"
            :key="action.id"
            :id="`cmd-item-${i}`"
            class="uds-command-palette__item"
            :class="{ 'uds-command-palette__item--active': activeIndex === i }"
            role="option"
            :aria-selected="activeIndex === i"
            @click="selectAction(action)"
            @mouseenter="activeIndex = i"
          >
            <span class="uds-command-palette__label">{{ action.label }}</span>
            <kbd v-if="action.shortcut" class="uds-command-palette__shortcut">{{ action.shortcut }}</kbd>
          </li>
          <li v-if="filteredActions.length === 0" class="uds-command-palette__empty" role="option" aria-disabled="true">
            No results found
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
