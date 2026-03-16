import type React from 'react';
import { useCallback, useState } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface TreeViewProps {
  /** Tree data. */
  nodes: TreeNode[];
  /** Selected node id(s) when selectionMode is single, or array for multi. */
  selectedIds?: string | string[];
  /** Callback when selection changes. */
  onSelect?: (ids: string[]) => void;
  /** Callback when a node is expanded/collapsed. */
  onExpand?: (id: string, expanded: boolean) => void;
  /** Selection behavior. @default 'single' */
  selectionMode?: 'single' | 'multi' | 'none';
  /** Initially expanded node ids (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Additional CSS class for the root. */
  className?: string;
  /** Accessible label for the tree. */
  'aria-label'?: string;
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
    if (selectionMode !== 'none') {
      if (selectionMode === 'single') onSelect([node.id]);
      else {
        const next = new Set(selectedSet);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        onSelect(Array.from(next));
      }
    }
  }, [node.id, hasChildren, isExpanded, selectionMode, selectedSet, onToggle, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (hasChildren) onToggle(node.id, !isExpanded);
        if (selectionMode !== 'none') {
          if (selectionMode === 'single') onSelect([node.id]);
          else {
            const next = new Set(selectedSet);
            if (next.has(node.id)) next.delete(node.id);
            else next.add(node.id);
            onSelect(Array.from(next));
          }
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (selectionMode !== 'none') {
          if (selectionMode === 'single') onSelect([node.id]);
          else {
            const next = new Set(selectedSet);
            if (next.has(node.id)) next.delete(node.id);
            else next.add(node.id);
            onSelect(Array.from(next));
          }
        }
      }
      if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
        e.preventDefault();
        onToggle(node.id, true);
      }
      if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
        e.preventDefault();
        onToggle(node.id, false);
      }
    },
    [node.id, hasChildren, isExpanded, selectionMode, selectedSet, onToggle, onSelect],
  );

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={level}
      aria-selected={selectionMode !== 'none' ? isSelected : undefined}
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
      {hasChildren && (
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

  const selectedArray = Array.isArray(selectedIds)
    ? selectedIds
    : selectedIds != null
      ? [selectedIds]
      : [];
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
