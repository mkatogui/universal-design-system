import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../../packages/react/src/components/DatePicker/DatePicker';

describe('DatePicker', () => {
  it('renders a date input by default', () => {
    render(<DatePicker />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
  });

  it('renders with a visible label', () => {
    render(<DatePicker label="Start date" />);
    expect(screen.getByText('Start date')).toBeInTheDocument();
  });

  it('associates the label with the input via htmlFor', () => {
    render(<DatePicker label="Birth date" />);
    const label = screen.getByText('Birth date');
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(label).toHaveAttribute('for', input.id);
  });

  it('uses type="date" for the default single variant', () => {
    render(<DatePicker />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'date');
  });

  it('uses type="datetime-local" for the with-time variant', () => {
    render(<DatePicker variant="with-time" />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'datetime-local');
  });

  it('calls onChange with the selected date value', () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2024-06-15' } });
    expect(handleChange).toHaveBeenCalledWith('2024-06-15');
  });

  it('reflects the controlled value', () => {
    render(<DatePicker value="2024-01-20" onChange={vi.fn()} />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toHaveValue('2024-01-20');
  });

  it('applies the min and max attributes to the input', () => {
    render(<DatePicker min="2024-01-01" max="2024-12-31" />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toHaveAttribute('min', '2024-01-01');
    expect(input).toHaveAttribute('max', '2024-12-31');
  });

  it('disables the input when disabled prop is true', () => {
    render(<DatePicker disabled />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('adds the disabled modifier class when disabled', () => {
    const { container } = render(<DatePicker disabled />);
    expect(container.querySelector('.uds-date-picker')).toHaveClass('uds-date-picker--disabled');
  });

  it('adds the open modifier class when input receives focus', () => {
    const { container } = render(<DatePicker />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    fireEvent.focus(input);
    expect(container.querySelector('.uds-date-picker')).toHaveClass('uds-date-picker--open');
  });

  it('removes the open modifier class when input loses focus', () => {
    const { container } = render(<DatePicker />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(container.querySelector('.uds-date-picker')).not.toHaveClass('uds-date-picker--open');
  });

  it('uses aria-label "Select date" when no label is provided', () => {
    render(<DatePicker />);
    const input = document.querySelector('.uds-date-picker__input') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-label', 'Select date');
  });

  it('forwards a ref object to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DatePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-date-picker');
  });

  it('forwards a callback ref to the root div element', () => {
    const callbackRef = vi.fn();
    render(<DatePicker ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
