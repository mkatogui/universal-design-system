import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../../packages/react/src/components/Radio/Radio';

describe('Radio', () => {
  it('renders with a visible label linked to the input', () => {
    render(<Radio name="plan" value="free" label="Free" />);
    const input = screen.getByLabelText('Free');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'radio');
  });

  it('reflects checked and unchecked state via aria-checked', () => {
    const { rerender } = render(
      <Radio name="plan" value="free" label="Free" checked onChange={vi.fn()} />,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <Radio name="plan" value="free" label="Free" checked={false} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when the radio is clicked', () => {
    const handleChange = vi.fn();
    render(<Radio name="plan" value="pro" label="Pro" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled and cannot be interacted with when disabled prop is set', () => {
    render(<Radio name="plan" value="enterprise" label="Enterprise" disabled />);
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeDisabled();
  });

  it('applies variant and custom className', () => {
    const { container } = render(
      <Radio name="plan" value="card" label="Card" variant="card" className="extra" />,
    );
    const wrapper = container.querySelector('.uds-radio');
    expect(wrapper).toHaveClass('uds-radio--card');
    expect(wrapper).toHaveClass('extra');
  });

  it('groups multiple radios by shared name attribute', () => {
    render(
      <>
        <Radio name="size" value="sm" label="Small" />
        <Radio name="size" value="md" label="Medium" />
        <Radio name="size" value="lg" label="Large" />
      </>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio).toHaveAttribute('name', 'size');
    }
  });

  it('forwards a ref object to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Radio ref={ref} name="plan" value="free" label="Free" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });

  it('forwards a callback ref to the input element', () => {
    const callbackRef = vi.fn();
    render(<Radio ref={callbackRef} name="plan" value="pro" label="Pro" />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
  });
});
