import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from '../../packages/react/src/components/Dropdown/Dropdown';

const defaultItems = [
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete' },
  { label: 'Share', value: 'share' },
];

describe('Dropdown', () => {
  it('renders the trigger element', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
  });

  it('menu is closed by default', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu when trigger is clicked', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes the menu when trigger is clicked again', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders all menu items as menuitems when open', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);
    expect(menuItems[0]).toHaveTextContent('Edit');
    expect(menuItems[1]).toHaveTextContent('Delete');
    expect(menuItems[2]).toHaveTextContent('Share');
  });

  it('calls onSelect with the correct value when an item is clicked', () => {
    const handleSelect = vi.fn();
    render(<Dropdown trigger="Actions" items={defaultItems} onSelect={handleSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(handleSelect).toHaveBeenCalledWith('edit');
  });

  it('closes the menu after an item is selected', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens menu with ArrowDown key and focuses first item', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveClass('uds-dropdown__item--active');
  });

  it('navigates down through items with ArrowDown key', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[1]).toHaveClass('uds-dropdown__item--active');
  });

  it('navigates up through items with ArrowUp key', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    fireEvent.keyDown(wrapper, { key: 'ArrowUp' });
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveClass('uds-dropdown__item--active');
  });

  it('closes the menu on Escape key', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(wrapper, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('selects the active item with Enter key', () => {
    const handleSelect = vi.fn();
    render(<Dropdown trigger="Actions" items={defaultItems} onSelect={handleSelect} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
    fireEvent.keyDown(wrapper, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledWith('edit');
  });

  it('does not select disabled items', () => {
    const handleSelect = vi.fn();
    const items = [
      { label: 'Edit', value: 'edit', disabled: true },
      { label: 'Delete', value: 'delete' },
    ];
    render(<Dropdown trigger="Actions" items={items} onSelect={handleSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const disabledItem = screen.getByRole('menuitem', { name: 'Edit' });
    expect(disabledItem).toBeDisabled();
  });

  it('sets aria-haspopup and aria-expanded on the trigger button', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies BEM class modifiers for variant, size, and position', () => {
    render(
      <Dropdown
        trigger="Actions"
        items={defaultItems}
        variant="context"
        size="lg"
        position="bottom-end"
      />,
    );
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    expect(wrapper).toHaveClass('uds-dropdown');
    expect(wrapper).toHaveClass('uds-dropdown--context');
    expect(wrapper).toHaveClass('uds-dropdown--lg');
    expect(wrapper).toHaveClass('uds-dropdown--bottom-end');
  });

  it('applies additional className to the wrapper', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} className="custom-dropdown" />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    expect(wrapper).toHaveClass('custom-dropdown');
  });

  it('renders item icons when provided', () => {
    const itemsWithIcons = [{ label: 'Edit', value: 'edit', icon: <span data-testid="edit-icon" /> }];
    render(<Dropdown trigger="Actions" items={itemsWithIcons} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });

  it('adds uds-dropdown--open class when menu is open', () => {
    render(<Dropdown trigger="Actions" items={defaultItems} />);
    const wrapper = screen.getByRole('button', { name: 'Actions' }).parentElement!;
    expect(wrapper).not.toHaveClass('uds-dropdown--open');
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(wrapper).toHaveClass('uds-dropdown--open');
  });
});
