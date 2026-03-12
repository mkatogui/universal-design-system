<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, useId } from 'vue'

interface DropdownItem {
  label: string
  value: string
  disabled?: boolean
  icon?: string
}

interface Props {
  variant?: 'action' | 'context' | 'nav-sub'
  size?: 'sm' | 'md' | 'lg'
  items?: DropdownItem[]
  position?: 'bottom-start' | 'bottom-end'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'action',
  size: 'md',
  items: () => [],
  position: 'bottom-start',
})

const emit = defineEmits<{
  select: [value: string]
}>()

const isOpen = ref(false)
const menuId = useId()
const activeIndex = ref(-1)
const menuRef = ref<HTMLElement | null>(null)
const itemRefs = ref<(HTMLElement | null)[]>([])

const classes = computed(() =>
  [
    'uds-dropdown',
    `uds-dropdown--${props.variant}`,
    `uds-dropdown--${props.size}`,
    isOpen.value && 'uds-dropdown--open',
  ]
    .filter(Boolean)
    .join(' ')
)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    activeIndex.value = 0
  }
}

function close() {
  isOpen.value = false
  activeIndex.value = -1
}

function selectItem(item: DropdownItem) {
  if (item.disabled) return
  emit('select', item.value)
  close()
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  const enabledItems = props.items.filter((i) => !i.disabled)

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % enabledItems.length
    itemRefs.value[activeIndex.value]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + enabledItems.length) % enabledItems.length
    itemRefs.value[activeIndex.value]?.focus()
  } else if (e.key === 'Escape') {
    close()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (activeIndex.value >= 0) {
      selectItem(enabledItems[activeIndex.value])
    }
  }
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="menuRef" :class="classes" @keydown="handleKeydown">
    <button
      class="uds-dropdown__trigger"
      :aria-haspopup="true"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      @click="toggle"
    >
      <slot name="trigger">Menu</slot>
    </button>
    <ul
      v-if="isOpen"
      :id="menuId"
      class="uds-dropdown__menu"
      role="menu"
    >
      <li
        v-for="(item, i) in items"
        :key="item.value"
        :ref="(el) => { itemRefs[i] = el as HTMLElement }"
        class="uds-dropdown__item"
        role="menuitem"
        :tabindex="activeIndex === i ? 0 : -1"
        :aria-disabled="item.disabled || undefined"
        @click="selectItem(item)"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>
