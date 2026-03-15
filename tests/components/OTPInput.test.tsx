import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { OTPInput } from '../../packages/react/src/components/OTPInput/OTPInput';

describe('OTPInput', () => {
  it('renders with group role and aria-label', () => {
    render(<OTPInput value="" length={4} />);
    expect(screen.getByRole('group', { name: 'One-time code' })).toBeInTheDocument();
  });

  it('renders 4 inputs by default', () => {
    render(<OTPInput value="" />);
    expect(screen.getByLabelText('Digit 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 4')).toBeInTheDocument();
  });

  it('renders 6 inputs when length is 6', () => {
    render(<OTPInput value="" length={6} />);
    expect(screen.getByLabelText('Digit 6')).toBeInTheDocument();
  });

  it('calls onChange when a digit is entered', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('displays controlled value in inputs', () => {
    render(<OTPInput value="12" length={4} />);
    expect(screen.getByLabelText('Digit 1')).toHaveValue('1');
    expect(screen.getByLabelText('Digit 2')).toHaveValue('2');
    expect(screen.getByLabelText('Digit 3')).toHaveValue('');
  });

  it('applies uds-otp-input class', () => {
    const { container } = render(<OTPInput value="" />);
    expect(container.querySelector('.uds-otp-input')).toBeInTheDocument();
  });

  it('inputs have autocomplete="one-time-code"', () => {
    render(<OTPInput value="" />);
    expect(screen.getByLabelText('Digit 1')).toHaveAttribute('autocomplete', 'one-time-code');
  });
});
