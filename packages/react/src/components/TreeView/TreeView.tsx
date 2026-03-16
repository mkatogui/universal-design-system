import type React from 'react';
import { useCallback, useState } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface TreeViewProps {
  /** Tree data. */
  readonly nodes: readonly TreeNode[];
  /** Selected node id(s) when selectionMode is single, or array for multi. */
  readonly selectedIds?: string | string[];
  /** Callback when selection changes. */
  readonly onSelect?: (ids: string[]) => void;
  /** Callback when a node is expanded/collapsed. */
  readonly onExpand?: (id: string, expanded: boolean) => void;
  /** Selection behavior. @default 'single' */
  readonly selectionMode?: 'single' | 'multi' | 'none';
  /** Initially expanded node ids (uncontrolled). */
  readonly defaultExpandedIds?: readonly string[];
  /** Additional CSS class for the root. */
  readonly className?: string;
  /** Accessible label for the tree. */
  readonly 'aria-label'?: string;
}

/** Compute the next selection based on mode, current selection, and target node id. */
function computeSelection(
  nodeId: string,
  selectionMode: 'single' | 'multi' | 'none',
  selectedSet: Set<string>,
  onSelect: (ids: string[]) => void,
): void {
  if (selectionMode === 'none') return;
  if (selectionMode === 'single') {
    onSelect([nodeId]);
    return;
  }
  const next = new Set(selectedSet);
  if (next.has(nodeId)) next.delete(nodeId);
  else next.add(nodeId);
  onSelect(Array.from(next));
}

/** Handle keyboard interactions for a tree item. */
function handleTreeItemKeyDown(
  e: React.KeyboardEvent,
  nodeId: string,
  hasChildren: boolean,
  isExpanded: boolean,
  selectionMode: 'single' | 'multi' | 'none',
  selectedSet: Set<string>,
  onToggle: (id: string, expanded: boolean) => void,
  onSelect: (ids: string[]) => void,
): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (hasChildren) onToggle(nodeId, !isExpanded);
    computeSelection(nodeId, selectionMode, selectedSet, onSelect);
    return;
  }
  if (e.key === ' ') {
    e.preventDefault();
    computeSelection(nodeId, selectionMode, selectedSet, onSelect);
    return;
  }
  if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
    e.preventDefault();
    onToggle(nodeId, true);
    return;
  }
  if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
    e.preventDefault();
    onToggle(nodeId, false);
  }
}

/** Render the children of a tree item. */
function renderTreeChildren(
  node: TreeNode,
  level: number,
  isExpanded: boolean,
  expandedSet: Set<string>,
  onToggle: (id: string, expanded: boolean) => void,
  selectedSet: Set<string>,
  onSelect: (ids: string[]) => void,
  selectionMode: 'single' | 'multi' | 'none',
) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: tree group uses role=group per ARIA tree pattern
    <div role="group" className="uds-tree__group">
      {isExpanded &&
        node.children?.map((child) => (
          <TreeItemInner
            key={child.id}
            node={child}
            level={level + 1}
            expandedSet={expandedSet}
            onToggle={onToggle}
            selectedSet={selectedSet}
            onSelect={onSelect}
            selectionMode={selectionMode}
          />
        ))}
    </div>
  );
}

function TreeItemInner({
  node,
  level,
  expandedSet,
  onToggle,
  selectedSet,
  onSelect,
  selectionMode,
}: {
  node: TreeNode;
  level: number;
  expandedSet: Set<string>;
  onToggle: (id: string, expanded: boolean) => void;
  selectedSet: Set<string>;
  onSelect: (ids: string[]) => void;
  selectionMode: 'single' | 'multi' | 'none';
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedSet.has(node.id);
  const isSelected = selectedSet.has(node.id);

  const handleClick = useCallback(() => {
    if (hasChildren) onToggle(node.id, !isExpanded);
    computeSelection(node.id, selectionMode, selectedSet, onSelect);
  }, [node.id, hasChildren, isExpanded, selectionMode, selectedSet, onToggle, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleTreeItemKeyDown(
        e,
        node.id,
        !!hasChildren,
        isExpanded,
        selectionMode,
        selectedSet,
        onToggle,
        onSelect,
      );
    },
    [node.id, hasChildren, isExpanded, selectionMode, selectedSet, onToggle, onSelect],
  );

  const ariaSelected = selectionMode === 'none' ? undefined : isSelected;

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={level}
      aria-selected={ariaSelected}
      className={[
        'uds-tree__item',
        hasChildren && 'uds-tree__item--branch',
        isSelected && 'uds-tree__item--selected',
      ]
        .filter(Boolean)
        .join(' ')}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="uds-tree__item-label">{node.label}</span>
      {hasChildren &&
        renderTreeChildren(
          node,
          level,
          isExpanded,
          expandedSet,
          onToggle,
          selectedSet,
          onSelect,
          selectionMode,
        )}
    </div>
  );
}

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  selectedIds,
  onSelect,
  onExpand,
  selectionMode = 'single',
  defaultExpandedIds = [],
  className,
  'aria-label': ariaLabel = 'Tree',
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpandedIds));

  let selectedArray: string[];
  if (Array.isArray(selectedIds)) {
    selectedArray = selectedIds;
  } else if (selectedIds == null) {
    selectedArray = [];
  } else {
    selectedArray = [selectedIds];
  }
  const selectedSet = new Set(selectedArray);

  const handleSelect = useCallback(
    (ids: string[]) => {
      onSelect?.(ids);
    },
    [onSelect],
  );

  const handleToggle = useCallback(
    (id: string, isExpanded: boolean) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (isExpanded) next.add(id);
        else next.delete(id);
        return next;
      });
      onExpand?.(id, isExpanded);
    },
    [onExpand],
  );

  const classes = ['uds-tree', className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multi'}
    >
      {nodes.map((node) => (
        <TreeItemInner
          key={node.id}
          node={node}
          level={1}
          expandedSet={expanded}
          onToggle={handleToggle}
          selectedSet={selectedSet}
          onSelect={handleSelect}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  );
};

TreeView.displayName = 'TreeView';
