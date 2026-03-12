import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '../../packages/react/src/components/CommandPalette/CommandPalette';

const defaultActions = [
  { id: 'save', label: 'Save file', shortcut: 'Cmd+S' },
  { id: 'open', label: 'Open file', shortcut: 'Cmd+O' },
  { id: 'close', label: 'Close tab' },
  { id: 'disabled-action', label: 'Locked action', disabled: true },
];

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onSelect: vi.fn(),
  actions: defaultActions,
};

describe('CommandPalette', () => {
  it('does not render when open is false', () => {
    render(
      <CommandPalette
        open={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        actions={defaultActions}
      />,
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders with default BEM classes when open', () => {
    const { container } = render(<CommandPalette {...baseProps} />);
    const palette = container.querySelector('.uds-command-palette');
    expect(palette).toBeInTheDocument();
    expect(palette).toHaveClass('uds-command-palette--md');
  });

  it('applies the lg size modifier', () => {
    const { container } = render(<CommandPalette {...baseProps} size="lg" />);
    expect(container.querySelector('.uds-command-palette')).toHaveClass('uds-command-palette--lg');
  });

  it('renders the search input with correct ARIA attributes', () => {
    render(<CommandPalette {...baseProps} />);
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('renders the overlay wrapping element', () => {
    const { container } = render(<CommandPalette {...baseProps} />);
    expect(container.querySelector('.uds-command-palette-overlay')).toBeInTheDocument();
  });

  it('renders the listbox with role="listbox" and all action options', () => {
    render(<CommandPalette {...baseProps} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
  });

  it('renders a keyboard shortcut hint for actions that have one', () => {
    render(<CommandPalette {...baseProps} />);
    expect(screen.getByText('Cmd+S')).toBeInTheDocument();
    expect(screen.getByText('Cmd+O')).toBeInTheDocument();
  });

  it('filters actions based on typed query', () => {
    render(<CommandPalette {...baseProps} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'save' } });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Save file');
  });

  it('shows empty state when no actions match the query', () => {
    render(<CommandPalette {...baseProps} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'zzznomatch' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed on the document', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...baseProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect and onClose when Enter is pressed on an active non-disabled action', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...baseProps} onSelect={onSelect} onClose={onClose} />);
    const input = screen.getByRole('searchbox');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('save');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves active index with ArrowDown and ArrowUp', () => {
    render(<CommandPalette {...baseProps} />);
    const input = screen.getByRole('searchbox');
    const options = screen.getAllByRole('option');

    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect and onClose when a non-disabled action is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...baseProps} onSelect={onSelect} onClose={onClose} />);
    const options = screen.getAllByRole('option');

    fireEvent.click(options[1]);
    expect(onSelect).toHaveBeenCalledWith('open');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when a disabled action is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...baseProps} onSelect={onSelect} onClose={onClose} />);
    const options = screen.getAllByRole('option');
    const disabledOption = options.find((o) => o.getAttribute('aria-disabled') === 'true');
    expect(disabledOption).toBeInTheDocument();

    fireEvent.click(disabledOption!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('forwards a ref object to the palette panel div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CommandPalette {...baseProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-command-palette');
  });

  it('forwards a callback ref to the palette panel div', () => {
    const callbackRef = vi.fn();
    render(<CommandPalette {...baseProps} ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
