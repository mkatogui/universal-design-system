import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from '../../packages/react/src/components/Combobox/Combobox';

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'br', label: 'Brazil' },
];

describe('Combobox', () => {
  it('renders with a visible label', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('has role="combobox" on the input', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('shows listbox when input is focused', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('filters options as user types', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'can' } });
    const listboxOptions = screen.getAllByRole('option');
    expect(listboxOptions).toHaveLength(1);
    expect(listboxOptions[0]).toHaveTextContent('Canada');
  });

  it('calls onSelect when an option is clicked', () => {
    const handleSelect = vi.fn();
    render(<Combobox label="Country" options={options} onSelect={handleSelect} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByText('Canada'));
    expect(handleSelect).toHaveBeenCalledWith('ca');
  });

  it('navigates options with ArrowDown and ArrowUp', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'combobox-opt-us');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'combobox-opt-ca');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-activedescendant', 'combobox-opt-us');
  });

  it('selects option with Enter key', () => {
    const handleSelect = vi.fn();
    render(<Combobox label="Country" options={options} onSelect={handleSelect} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledWith('ca');
  });

  it('closes listbox with Escape key', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows "No results found" when filter matches nothing', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows error state with aria-invalid and error message', () => {
    render(
      <Combobox label="Country" options={options} onSelect={vi.fn()} errorText="Required field" />,
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('has aria-describedby linking to error message', () => {
    render(
      <Combobox label="Country" options={options} onSelect={vi.fn()} errorText="Required field" />,
    );
    const input = screen.getByRole('combobox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveAttribute('id', describedBy);
  });

  it('renders disabled state', () => {
    render(<Combobox label="Country" options={options} onSelect={vi.fn()} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies size classes', () => {
    const { container } = render(
      <Combobox label="Country" options={options} onSelect={vi.fn()} size="lg" />,
    );
    expect(container.querySelector('.uds-combobox')).toHaveClass('uds-combobox--lg');
  });

  it('supports multiselect variant with aria-multiselectable', () => {
    const handleSelect = vi.fn();
    render(
      <Combobox
        label="Countries"
        options={options}
        onSelect={handleSelect}
        variant="multiselect"
        value={['us']}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    fireEvent.click(screen.getByText('Canada'));
    expect(handleSelect).toHaveBeenCalledWith(['us', 'ca']);
  });
});
