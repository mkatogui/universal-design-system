<script lang="ts">
  export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
  }

  interface Props {
    nodes: TreeNode[];
    selectedIds?: string | string[];
    onSelect?: (ids: string[]) => void;
    onExpand?: (id: string, expanded: boolean) => void;
    selectionMode?: 'single' | 'multi' | 'none';
    defaultExpandedIds?: string[];
    ariaLabel?: string;
    class?: string;
    [key: string]: unknown;
  }

  let {
    nodes,
    selectedIds,
    onSelect,
    onExpand,
    selectionMode = 'single',
    defaultExpandedIds = [],
    ariaLabel = 'Tree',
    class: className = '',
    ...rest
  }: Props = $props();

  let expanded = $state<Set<string>>(new Set(defaultExpandedIds));

  let selectedArray = $derived(
    Array.isArray(selectedIds) ? selectedIds : selectedIds != null ? [selectedIds] : []
  );
  let selectedSet = $derived(new Set(selectedArray));

  let classes = $derived(['uds-tree', className].filter(Boolean).join(' '));

  function toggle(id: string, isExp: boolean) {
    const next = new Set(expanded);
    if (isExp) next.add(id);
    else next.delete(id);
    expanded = next;
    onExpand?.(id, isExp);
  }

  function handleSelect(ids: string[]) {
    onSelect?.(ids);
  }
</script>

<div class={classes} role="tree" aria-label={ariaLabel} aria-multiselectable={selectionMode === 'multi'} {...rest}>
  {#each nodes as node}
    <div
      class="uds-tree__item {node.children?.length ? 'uds-tree__item--branch' : ''} {selectedSet.has(node.id) ? 'uds-tree__item--selected' : ''}"
      role="treeitem"
      aria-expanded={node.children?.length ? expanded.has(node.id) : undefined}
      aria-level="1"
      aria-selected={selectionMode !== 'none' ? selectedSet.has(node.id) : undefined}
      tabindex="0"
      onclick={() => {
        if (node.children?.length) toggle(node.id, !expanded.has(node.id));
        if (selectionMode !== 'none') {
          if (selectionMode === 'single') handleSelect([node.id]);
          else handleSelect(selectedSet.has(node.id) ? selectedArray.filter((x) => x !== node.id) : [...selectedArray, node.id]);
        }
      }}
    >
      <span class="uds-tree__item-label">{node.label}</span>
      {#if node.children?.length && expanded.has(node.id)}
        <div role="group" class="uds-tree__group">
          {#each node.children as child}
            <div
              class="uds-tree__item {selectedSet.has(child.id) ? 'uds-tree__item--selected' : ''}"
              role="treeitem"
              aria-level="2"
              aria-selected={selectionMode !== 'none' ? selectedSet.has(child.id) : undefined}
              tabindex="0"
              onclick={() => selectionMode !== 'none' && handleSelect(selectionMode === 'single' ? [child.id] : [])}
            >
              <span class="uds-tree__item-label">{child.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
