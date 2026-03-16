import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { TreeView } from '../../packages/react/src/components/TreeView/TreeView';

const nodes = [
  {
    id: '1',
    label: 'Documents',
    children: [
      { id: '2', label: 'File 1' },
      { id: '3', label: 'File 2' },
    ],
  },
];

const nestedNodes = [
  {
    id: '1',
    label: 'Root',
    children: [
      {
        id: '2',
        label: 'Folder A',
        children: [
          { id: '3', label: 'File A1' },
          { id: '4', label: 'File A2' },
        ],
      },
      { id: '5', label: 'File B' },
    ],
  },
];

describe('TreeView', () => {
  it('renders with tree role and aria-label', () => {
    render(<TreeView nodes={nodes} aria-label="Folder structure" />);
    const tree = screen.getByRole('tree', { name: 'Folder structure' });
    expect(tree).toBeInTheDocument();
  });

  it('renders root node label', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('expands node and shows children when defaultExpandedIds is set', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} />);
    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByText('File 2')).toBeInTheDocument();
  });

  it('calls onSelect when a node is clicked (selectionMode single)', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="single"
      />,
    );
    fireEvent.click(screen.getByText('File 1'));
    expect(onSelect).toHaveBeenCalledWith(['2']);
  });

  it('marks selected node when selectedIds is provided', () => {
    render(
      <TreeView nodes={nodes} defaultExpandedIds={['1']} selectedIds="2" selectionMode="single" />,
    );
    const item = screen.getByText('File 1').closest('[role="treeitem"]');
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('applies uds-tree class to root', () => {
    const { container } = render(<TreeView nodes={nodes} />);
    expect(container.querySelector('.uds-tree')).toBeInTheDocument();
  });

  // --- NEW TESTS for uncovered lines ---

  it('expands a collapsed branch node on click', () => {
    render(<TreeView nodes={nodes} />);
    // Initially collapsed; children not visible
    expect(screen.queryByText('File 1')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Documents'));
    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByText('File 2')).toBeInTheDocument();
  });

  it('collapses an expanded branch node on click', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} />);
    expect(screen.getByText('File 1')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText('Documents'));
    expect(screen.queryByText('File 1')).not.toBeInTheDocument();
  });

  it('calls onExpand when a branch node is expanded', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={nodes} onExpand={onExpand} />);
    fireEvent.click(screen.getByText('Documents'));
    expect(onExpand).toHaveBeenCalledWith('1', true);
  });

  it('calls onExpand when a branch node is collapsed', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} onExpand={onExpand} />);
    fireEvent.click(screen.getByText('Documents'));
    expect(onExpand).toHaveBeenCalledWith('1', false);
  });

  it('toggles selection in multi mode on click', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="multi"
        selectedIds={['2']}
      />,
    );
    // Click File 2 to add to selection
    fireEvent.click(screen.getByText('File 2'));
    expect(onSelect).toHaveBeenCalledWith(['2', '3']);
  });

  it('removes from selection in multi mode when already selected', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="multi"
        selectedIds={['2', '3']}
      />,
    );
    // Click File 1 which is already selected (id '2')
    fireEvent.click(screen.getByText('File 1'));
    expect(onSelect).toHaveBeenCalledWith(['3']);
  });

  it('does not call onSelect when selectionMode is none', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="none"
      />,
    );
    fireEvent.click(screen.getByText('File 1'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not set aria-selected when selectionMode is none', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} selectionMode="none" />);
    const item = screen.getByText('File 1').closest('[role="treeitem"]');
    expect(item).not.toHaveAttribute('aria-selected');
  });

  it('sets aria-multiselectable when selectionMode is multi', () => {
    render(<TreeView nodes={nodes} selectionMode="multi" />);
    const tree = screen.getByRole('tree');
    expect(tree).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('expands branch node on Enter key', () => {
    render(<TreeView nodes={nodes} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'Enter' });
    expect(screen.getByText('File 1')).toBeInTheDocument();
  });

  it('collapses branch node on Enter key when expanded', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'Enter' });
    expect(screen.queryByText('File 1')).not.toBeInTheDocument();
  });

  it('selects node on Enter key in single mode', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="single"
      />,
    );
    const file1 = screen.getByText('File 1').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(file1, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(['2']);
  });

  it('toggles multi-selection on Enter key', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="multi"
        selectedIds={['2']}
      />,
    );
    const file2 = screen.getByText('File 2').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(file2, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(['2', '3']);
  });

  it('selects node on Space key in single mode', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="single"
      />,
    );
    const file1 = screen.getByText('File 1').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(file1, { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith(['2']);
  });

  it('toggles multi-selection on Space key', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="multi"
        selectedIds={['2']}
      />,
    );
    const file1 = screen.getByText('File 1').closest('[role="treeitem"]') as HTMLElement;
    // File 1 (id '2') is already selected; pressing space should deselect
    fireEvent.keyDown(file1, { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it('does not select on Space key when selectionMode is none', () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        onSelect={onSelect}
        selectionMode="none"
      />,
    );
    const file1 = screen.getByText('File 1').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(file1, { key: ' ' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('expands collapsed branch on ArrowRight key', () => {
    render(<TreeView nodes={nodes} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'ArrowRight' });
    expect(screen.getByText('File 1')).toBeInTheDocument();
  });

  it('does not re-expand already expanded branch on ArrowRight', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} onExpand={onExpand} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'ArrowRight' });
    // Already expanded, ArrowRight should not trigger onExpand
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('collapses expanded branch on ArrowLeft key', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'ArrowLeft' });
    expect(screen.queryByText('File 1')).not.toBeInTheDocument();
  });

  it('does not collapse already collapsed branch on ArrowLeft', () => {
    const onExpand = vi.fn();
    render(<TreeView nodes={nodes} onExpand={onExpand} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(docsItem, { key: 'ArrowLeft' });
    // Already collapsed, ArrowLeft should not trigger
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('applies branch class to nodes with children', () => {
    render(<TreeView nodes={nodes} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]');
    expect(docsItem).toHaveClass('uds-tree__item--branch');
  });

  it('applies selected class to selected nodes', () => {
    render(
      <TreeView nodes={nodes} defaultExpandedIds={['1']} selectedIds="2" selectionMode="single" />,
    );
    const file1Item = screen.getByText('File 1').closest('[role="treeitem"]');
    expect(file1Item).toHaveClass('uds-tree__item--selected');
  });

  it('sets aria-expanded on branch nodes', () => {
    render(<TreeView nodes={nodes} />);
    const docsItem = screen.getByText('Documents').closest('[role="treeitem"]');
    expect(docsItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('leaf nodes do not have aria-expanded', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['1']} />);
    const file1Item = screen.getByText('File 1').closest('[role="treeitem"]');
    expect(file1Item).not.toHaveAttribute('aria-expanded');
  });

  it('applies custom className to root', () => {
    const { container } = render(<TreeView nodes={nodes} className="custom" />);
    expect(container.querySelector('.uds-tree.custom')).toBeInTheDocument();
  });

  it('supports selectedIds as array', () => {
    render(
      <TreeView
        nodes={nodes}
        defaultExpandedIds={['1']}
        selectedIds={['2', '3']}
        selectionMode="multi"
      />,
    );
    const file1 = screen.getByText('File 1').closest('[role="treeitem"]');
    const file2 = screen.getByText('File 2').closest('[role="treeitem"]');
    expect(file1).toHaveAttribute('aria-selected', 'true');
    expect(file2).toHaveAttribute('aria-selected', 'true');
  });

  it('renders nested tree levels correctly', () => {
    render(<TreeView nodes={nestedNodes} defaultExpandedIds={['1', '2']} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Folder A')).toBeInTheDocument();
    expect(screen.getByText('File A1')).toBeInTheDocument();
    expect(screen.getByText('File B')).toBeInTheDocument();
  });

  it('sets correct aria-level on nested items', () => {
    render(<TreeView nodes={nestedNodes} defaultExpandedIds={['1', '2']} />);
    const root = screen.getByText('Root').closest('[role="treeitem"]');
    const folderA = screen.getByText('Folder A').closest('[role="treeitem"]');
    const fileA1 = screen.getByText('File A1').closest('[role="treeitem"]');
    expect(root).toHaveAttribute('aria-level', '1');
    expect(folderA).toHaveAttribute('aria-level', '2');
    expect(fileA1).toHaveAttribute('aria-level', '3');
  });

  it('uses default aria-label "Tree" when none is provided', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByRole('tree', { name: 'Tree' })).toBeInTheDocument();
  });
});
