import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from '../../packages/react/src/components/ContextMenu/ContextMenu';

const sampleItems = [
  { id: 'copy', label: 'Copy' },
  { id: 'paste', label: 'Paste' },
  { id: 'delete', label: 'Delete', disabled: true },
];

describe('ContextMenu', () => {
  it('renders children', () => {
    render(
      <ContextMenu items={sampleItems}>
        <p>Right-click me</p>
      </ContextMenu>,
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('applies the uds-context-menu base class', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    expect(container.querySelector('.uds-context-menu')).toBeInTheDocument();
  });

  it('has role="region" and accessible label on the wrapper', () => {
    render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    expect(screen.getByRole('region', { name: 'Context menu trigger' })).toBeInTheDocument();
  });

  it('does not show the menu by default', () => {
    render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu on contextmenu event', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    const trigger = container.querySelector('.uds-context-menu')!;
    fireEvent.contextMenu(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders all menu items when opened', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(container.querySelector('.uds-context-menu')!);
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);
    expect(menuItems[0]).toHaveTextContent('Copy');
    expect(menuItems[1]).toHaveTextContent('Paste');
    expect(menuItems[2]).toHaveTextContent('Delete');
  });

  it('disables menu items that have disabled: true', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(container.querySelector('.uds-context-menu')!);
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
  });

  it('calls onSelect with the item id when a menu item is clicked', () => {
    const handleSelect = vi.fn();
    const { container } = render(
      <ContextMenu items={sampleItems} onSelect={handleSelect}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(container.querySelector('.uds-context-menu')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(handleSelect).toHaveBeenCalledWith('copy');
  });

  it('closes the menu after selecting an item', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(container.querySelector('.uds-context-menu')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Paste' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('passes through a custom className', () => {
    const { container } = render(
      <ContextMenu items={sampleItems} className="my-ctx">
        <p>Trigger</p>
      </ContextMenu>,
    );
    const root = container.querySelector('.uds-context-menu');
    expect(root).toHaveClass('uds-context-menu');
    expect(root).toHaveClass('my-ctx');
  });

  it('renders the menu via a portal into document.body', () => {
    const { container } = render(
      <ContextMenu items={sampleItems}>
        <p>Trigger</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(container.querySelector('.uds-context-menu')!);
    // The menu should be in document.body, not inside the container
    const menu = document.querySelector('.uds-context-menu__menu');
    expect(menu).toBeInTheDocument();
    expect(container.querySelector('.uds-context-menu__menu')).not.toBeInTheDocument();
  });
});
