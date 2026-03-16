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

  // --- NEW TESTS for uncovered lines ---

  it('applies size modifier class', () => {
    const { container } = render(<SegmentedControl options={options} value="a" size="sm" />);
    expect(container.firstChild).toHaveClass('uds-segmented-control--sm');
  });

  it('applies lg size modifier class', () => {
    const { container } = render(<SegmentedControl options={options} value="a" size="lg" />);
    expect(container.firstChild).toHaveClass('uds-segmented-control--lg');
  });

  it('applies icon-only modifier class when iconOnly is true', () => {
    const optionsWithIcons = options.map((o) => ({ ...o, icon: <span>icon</span> }));
    const { container } = render(
      <SegmentedControl options={optionsWithIcons} value="a" iconOnly />,
    );
    expect(container.firstChild).toHaveClass('uds-segmented-control--icon-only');
  });

  it('hides labels when iconOnly is true', () => {
    const optionsWithIcons = options.map((o) => ({ ...o, icon: <span>icon</span> }));
    const { container } = render(
      <SegmentedControl options={optionsWithIcons} value="a" iconOnly />,
    );
    expect(container.querySelector('.uds-segmented-control__label')).not.toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    const optionsWithIcons = [
      { value: 'a', label: 'Option A', icon: <span data-testid="icon-a">A</span> },
      { value: 'b', label: 'Option B' },
    ];
    render(<SegmentedControl options={optionsWithIcons} value="a" />);
    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
  });

  it('applies disabled modifier class', () => {
    const { container } = render(<SegmentedControl options={options} value="a" disabled />);
    expect(container.firstChild).toHaveClass('uds-segmented-control--disabled');
  });

  it('sets aria-disabled on root when disabled', () => {
    render(<SegmentedControl options={options} value="a" disabled />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call onChange when disabled and clicked', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" disabled onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Option B' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates with ArrowRight key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('navigates with ArrowDown key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('navigates with ArrowLeft key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="b" onChange={onChange} />);
    const optB = screen.getByRole('radio', { name: 'Option B' });
    fireEvent.keyDown(optB, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('navigates with ArrowUp key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="b" onChange={onChange} />);
    const optB = screen.getByRole('radio', { name: 'Option B' });
    fireEvent.keyDown(optB, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('navigates to first option with Home key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="c" onChange={onChange} />);
    const optC = screen.getByRole('radio', { name: 'Option C' });
    fireEvent.keyDown(optC, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('navigates to last option with End key', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('does not navigate past the first option on ArrowLeft', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'ArrowLeft' });
    // Clamped to index 0, so still 'a'
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('does not navigate past the last option on ArrowRight', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="c" onChange={onChange} />);
    const optC = screen.getByRole('radio', { name: 'Option C' });
    fireEvent.keyDown(optC, { key: 'ArrowRight' });
    // Clamped to last index, so still 'c'
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('does not handle keyboard navigation when disabled', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" disabled onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works as uncontrolled with defaultValue', () => {
    render(<SegmentedControl options={options} defaultValue="b" />);
    expect(screen.getByRole('radio', { name: 'Option B' })).toHaveAttribute('aria-checked', 'true');
  });

  it('updates internal state on click when uncontrolled', () => {
    render(<SegmentedControl options={options} defaultValue="a" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Option C' }));
    expect(screen.getByRole('radio', { name: 'Option C' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <SegmentedControl options={options} value="a" className="my-class" />,
    );
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('ignores non-navigation key presses', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optA = screen.getByRole('radio', { name: 'Option A' });
    fireEvent.keyDown(optA, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
