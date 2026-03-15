import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { ChipInput } from '../../packages/react/src/components/ChipInput/ChipInput';

describe('ChipInput', () => {
  it('renders with listbox role', () => {
    render(<ChipInput value={[]} />);
    expect(screen.getByRole('listbox', { name: 'Chips' })).toBeInTheDocument();
  });

  it('renders existing chips', () => {
    render(<ChipInput value={['Tag 1', 'Tag 2']} />);
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<ChipInput value={[]} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox', { name: 'Add chip' });
    expect(input).toHaveAttribute('placeholder', 'Add tag...');
  });

  it('calls onChange when a chip is removed', () => {
    const onChange = vi.fn();
    render(<ChipInput value={['A', 'B']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove A' }));
    expect(onChange).toHaveBeenCalledWith(['B']);
  });

  it('adds chip on Enter and calls onChange', () => {
    const onChange = vi.fn();
    render(<ChipInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Add chip' });
    fireEvent.change(input, { target: { value: 'NewTag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['NewTag']);
  });

  it('applies uds-chip-input class', () => {
    const { container } = render(<ChipInput value={[]} />);
    expect(container.querySelector('.uds-chip-input')).toBeInTheDocument();
  });

  it('hides input when maxChips is reached', () => {
    render(<ChipInput value={['A', 'B']} maxChips={2} />);
    expect(screen.queryByRole('textbox', { name: 'Add chip' })).not.toBeInTheDocument();
  });
});
