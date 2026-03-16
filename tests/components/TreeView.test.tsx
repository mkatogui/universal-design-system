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
});
