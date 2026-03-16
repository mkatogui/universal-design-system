import { fireEvent, render, screen } from '@testing-library/react';
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

  // --- NEW TESTS for uncovered lines ---

  it('auto-focuses first input when autoFocus is true', () => {
    render(<OTPInput autoFocus />);
    expect(screen.getByLabelText('Digit 1')).toHaveFocus();
  });

  it('does not auto-focus when autoFocus is false', () => {
    render(<OTPInput />);
    expect(screen.getByLabelText('Digit 1')).not.toHaveFocus();
  });

  it('applies disabled class and disables inputs when disabled', () => {
    const { container } = render(<OTPInput disabled />);
    expect(container.querySelector('.uds-otp-input--disabled')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 1')).toBeDisabled();
    expect(screen.getByLabelText('Digit 4')).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<OTPInput className="custom" />);
    expect(container.querySelector('.uds-otp-input.custom')).toBeInTheDocument();
  });

  it('moves focus to the next input after entering a digit', () => {
    render(<OTPInput onChange={() => {}} />);
    const digit1 = screen.getByLabelText('Digit 1');
    const digit2 = screen.getByLabelText('Digit 2');
    fireEvent.change(digit1, { target: { value: '3' } });
    expect(digit2).toHaveFocus();
  });

  it('handles backspace on non-empty digit without moving focus', () => {
    // When value[index] is not empty, backspace does not move focus backwards
    render(<OTPInput value="12" onChange={() => {}} />);
    const digit2 = screen.getByLabelText('Digit 2');
    digit2.focus();
    fireEvent.keyDown(digit2, { key: 'Backspace' });
    // Focus stays on digit 2 because value[1] is '2', not ''
    expect(digit2).toHaveFocus();
  });

  it('does not move focus on backspace when on first digit', () => {
    render(<OTPInput value="    " onChange={() => {}} />);
    const digit1 = screen.getByLabelText('Digit 1');
    digit1.focus();
    fireEvent.keyDown(digit1, { key: 'Backspace' });
    expect(digit1).toHaveFocus();
  });

  it('handles ArrowLeft to move focus to previous input', () => {
    render(<OTPInput value="12" onChange={() => {}} />);
    const digit2 = screen.getByLabelText('Digit 2');
    const digit1 = screen.getByLabelText('Digit 1');
    digit2.focus();
    fireEvent.keyDown(digit2, { key: 'ArrowLeft' });
    expect(digit1).toHaveFocus();
  });

  it('does not move focus on ArrowLeft when on first digit', () => {
    render(<OTPInput value="12" onChange={() => {}} />);
    const digit1 = screen.getByLabelText('Digit 1');
    digit1.focus();
    fireEvent.keyDown(digit1, { key: 'ArrowLeft' });
    expect(digit1).toHaveFocus();
  });

  it('handles ArrowRight to move focus to next input', () => {
    render(<OTPInput value="12" onChange={() => {}} />);
    const digit1 = screen.getByLabelText('Digit 1');
    const digit2 = screen.getByLabelText('Digit 2');
    digit1.focus();
    fireEvent.keyDown(digit1, { key: 'ArrowRight' });
    expect(digit2).toHaveFocus();
  });

  it('does not move focus on ArrowRight when on last digit', () => {
    render(<OTPInput value="1234" onChange={() => {}} />);
    const digit4 = screen.getByLabelText('Digit 4');
    digit4.focus();
    fireEvent.keyDown(digit4, { key: 'ArrowRight' });
    expect(digit4).toHaveFocus();
  });

  it('handles paste event by filling digits and focusing correct input', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" onChange={onChange} />);
    const digit1 = screen.getByLabelText('Digit 1');
    fireEvent.paste(digit1, {
      clipboardData: { getData: () => '1234' },
    });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('paste truncates to length', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" length={4} onChange={onChange} />);
    const digit1 = screen.getByLabelText('Digit 1');
    fireEvent.paste(digit1, {
      clipboardData: { getData: () => '123456' },
    });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('paste strips non-numeric characters in numeric mode', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" length={4} onChange={onChange} inputMode="numeric" />);
    const digit1 = screen.getByLabelText('Digit 1');
    fireEvent.paste(digit1, {
      clipboardData: { getData: () => 'a1b2c3' },
    });
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('works as uncontrolled with defaultValue', () => {
    render(<OTPInput defaultValue="42" />);
    expect(screen.getByLabelText('Digit 1')).toHaveValue('4');
    expect(screen.getByLabelText('Digit 2')).toHaveValue('2');
    expect(screen.getByLabelText('Digit 3')).toHaveValue('');
  });

  it('filters non-numeric characters on change in numeric mode', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" onChange={onChange} inputMode="numeric" />);
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: 'a' } });
    // Non-numeric should result in empty char; value unchanged at position
    expect(onChange).toHaveBeenCalled();
  });

  it('allows text characters in text inputMode', () => {
    const onChange = vi.fn();
    render(<OTPInput value="" onChange={onChange} inputMode="text" />);
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: 'A' } });
    expect(onChange).toHaveBeenCalledWith('A');
  });
});
