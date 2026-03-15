<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

interface Props {
  nodes: TreeNode[]
  selectedIds?: string | string[]
  selectionMode?: 'single' | 'multi' | 'none'
  defaultExpandedIds?: string[]
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: 'single',
  ariaLabel: 'Tree',
})

const emit = defineEmits<{
  select: [ids: string[]]
  expand: [id: string, expanded: boolean]
}>()

const expanded = ref<Set<string>>(new Set(props.defaultExpandedIds ?? []))

const selectedArray = computed(() =>
  Array.isArray(props.selectedIds) ? props.selectedIds : props.selectedIds != null ? [props.selectedIds] : []
)
const selectedSet = computed(() => new Set(selectedArray.value))

function toggle(id: string, isExp: boolean) {
  const next = new Set(expanded.value)
  if (isExp) next.add(id)
  else next.delete(id)
  expanded.value = next
  emit('expand', id, isExp)
}

function handleSelect(ids: string[]) {
  emit('select', ids)
}
</script>

<template>
  <div class="uds-tree" role="tree" :aria-label="ariaLabel" :aria-multiselectable="selectionMode === 'multi'">
    <template v-for="node in nodes" :key="node.id">
      <div
        :class="[
          'uds-tree__item',
          node.children?.length && 'uds-tree__item--branch',
          selectedSet.has(node.id) && 'uds-tree__item--selected',
        ].filter(Boolean).join(' ')"
        role="treeitem"
        :aria-expanded="node.children?.length ? expanded.has(node.id) : undefined"
        aria-level="1"
        :aria-selected="selectionMode !== 'none' ? selectedSet.has(node.id) : undefined"
        tabindex="0"
        @click="node.children?.length && toggle(node.id, !expanded.has(node.id)); selectionMode !== 'none' && handleSelect(selectionMode === 'single' ? [node.id] : selectedSet.has(node.id) ? [...selectedArray].filter((x) => x !== node.id) : [...selectedArray, node.id])"
      >
        <span class="uds-tree__item-label">{{ node.label }}</span>
        <div v-if="node.children?.length && expanded.has(node.id)" role="group" class="uds-tree__group">
          <div
            v-for="child in node.children"
            :key="child.id"
            :class="['uds-tree__item', selectedSet.has(child.id) && 'uds-tree__item--selected'].filter(Boolean).join(' ')"
            role="treeitem"
            aria-level="2"
            :aria-selected="selectionMode !== 'none' ? selectedSet.has(child.id) : undefined"
            tabindex="0"
            @click="selectionMode !== 'none' && handleSelect(selectionMode === 'single' ? [child.id] : [])"
          >
            <span class="uds-tree__item-label">{{ child.label }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
