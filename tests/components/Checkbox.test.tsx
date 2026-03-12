import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../packages/react/src/components/Checkbox/Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders with a visible label and associates it with the input', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('reflects the checked state', () => {
    render(<Checkbox label="Check me" checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reflects the unchecked state', () => {
    render(<Checkbox label="Uncheck me" checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('fires onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Fire event" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders in disabled state', () => {
    render(<Checkbox label="Locked" disabled onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('sets aria-checked="mixed" when indeterminate is true', () => {
    render(<Checkbox label="Indeterminate" indeterminate onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('applies the indeterminate modifier class when indeterminate is true', () => {
    const { container } = render(<Checkbox indeterminate onChange={vi.fn()} />);
    expect(container.querySelector('.uds-checkbox')).toHaveClass('uds-checkbox--indeterminate');
  });

  it('applies the standard variant class by default', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.uds-checkbox')).toHaveClass('uds-checkbox--standard');
  });

  it('forwards a ref object to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('forwards a callback ref to the underlying input element', () => {
    const callbackRef = vi.fn();
    render(<Checkbox ref={callbackRef} label="Callback ref" />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
  });
});
