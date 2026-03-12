<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface TabItem {
  label: string
  disabled?: boolean
}

interface Props {
  variant?: 'line' | 'pill' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  tabs: TabItem[]
  defaultActive?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
  size: 'md',
  defaultActive: 0,
})

const emit = defineEmits<{
  change: [index: number]
}>()

const activeTab = ref(props.defaultActive)
const baseId = useId()
const tabRefs = ref<(HTMLElement | null)[]>([])

const classes = computed(() =>
  [
    'uds-tabs',
    `uds-tabs--${props.variant}`,
    `uds-tabs--${props.size}`,
  ]
    .filter(Boolean)
    .join(' ')
)

function selectTab(index: number) {
  if (props.tabs[index]?.disabled) return
  activeTab.value = index
  emit('change', index)
}

function handleKeydown(e: KeyboardEvent) {
  const enabledIndices = props.tabs
    .map((t, i) => (t.disabled ? -1 : i))
    .filter((i) => i >= 0)
  const currentPos = enabledIndices.indexOf(activeTab.value)
  let nextIndex: number | undefined

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length]
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    nextIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length]
  } else if (e.key === 'Home') {
    e.preventDefault()
    nextIndex = enabledIndices[0]
  } else if (e.key === 'End') {
    e.preventDefault()
    nextIndex = enabledIndices[enabledIndices.length - 1]
  }

  if (nextIndex !== undefined) {
    selectTab(nextIndex)
    tabRefs.value[nextIndex]?.focus()
  }
}
</script>

<template>
  <div :class="classes">
    <div class="uds-tabs__list" role="tablist" aria-orientation="horizontal" @keydown="handleKeydown">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        :ref="(el) => { tabRefs[i] = el as HTMLElement }"
        class="uds-tabs__trigger"
        role="tab"
        :id="`${baseId}-tab-${i}`"
        :aria-selected="activeTab === i"
        :aria-controls="`${baseId}-panel-${i}`"
        :tabindex="activeTab === i ? 0 : -1"
        :disabled="tab.disabled"
        @click="selectTab(i)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, i) in tabs"
      :key="i"
      class="uds-tabs__panel"
      role="tabpanel"
      :id="`${baseId}-panel-${i}`"
      :aria-labelledby="`${baseId}-tab-${i}`"
      :hidden="activeTab !== i"
      :tabindex="0"
    >
      <slot :name="`tab-${i}`" />
    </div>
  </div>
</template>
