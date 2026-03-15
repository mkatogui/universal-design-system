import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../../packages/react/src/components/SegmentedControl/SegmentedControl';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('SegmentedControl', () => {
  it('renders with radiogroup role and aria-label', () => {
    render(<SegmentedControl options={options} value="a" />);
    const group = screen.getByRole('radiogroup', { name: 'Options' });
    expect(group).toBeInTheDocument();
  });

  it('renders all options as radio buttons', () => {
    render(<SegmentedControl options={options} value="a" />);
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option C' })).toBeInTheDocument();
  });

  it('marks selected option with aria-checked="true"', () => {
    render(<SegmentedControl options={options} value="b" />);
    expect(screen.getByRole('radio', { name: 'Option B' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Option C' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('applies BEM root and selected option class', () => {
    const { container } = render(<SegmentedControl options={options} value="a" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('uds-segmented-control');
    const selected = screen.getByRole('radio', { name: 'Option A' });
    expect(selected).toHaveClass('uds-segmented-control__option--selected');
  });

  it('disables all options when disabled is true', () => {
    render(<SegmentedControl options={options} value="a" disabled />);
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeDisabled();
  });
});
