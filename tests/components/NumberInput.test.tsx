import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from '../../packages/react/src/components/NumberInput/NumberInput';

describe('NumberInput', () => {
  it('renders input with uds-number-input class', () => {
    const { container } = render(<NumberInput value={0} onChange={() => {}} />);
    expect(container.querySelector('.uds-number-input')).toBeInTheDocument();
    expect(container.querySelector('input[type="number"]')).toBeInTheDocument();
  });

  it('shows stepper buttons when showStepper', () => {
    render(<NumberInput value={5} showStepper onChange={() => {}} />);
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase')).toBeInTheDocument();
  });

  it('does not render stepper buttons by default', () => {
    render(<NumberInput value={5} onChange={() => {}} />);
    expect(screen.queryByLabelText('Decrease')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Increase')).not.toBeInTheDocument();
  });

  it('applies size modifier class', () => {
    const { container } = render(<NumberInput value={0} size="lg" onChange={() => {}} />);
    expect(container.querySelector('.uds-number-input--lg')).toBeInTheDocument();
  });

  it('applies stepper modifier class when showStepper is true', () => {
    const { container } = render(<NumberInput value={0} showStepper onChange={() => {}} />);
    expect(container.querySelector('.uds-number-input--stepper')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<NumberInput value={0} className="custom" onChange={() => {}} />);
    expect(container.querySelector('.uds-number-input.custom')).toBeInTheDocument();
  });

  it('calls onChange with incremented value when Increase is clicked', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} showStepper step={1} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('6');
  });

  it('calls onChange with decremented value when Decrease is clicked', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} showStepper step={1} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('4');
  });

  it('respects custom step value', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} showStepper step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange.mock.calls[0][0].target.value).toBe('15');
  });

  it('clamps value to max when incrementing above max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={9} showStepper step={5} max={10} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange.mock.calls[0][0].target.value).toBe('10');
  });

  it('clamps value to min when decrementing below min', () => {
    const onChange = vi.fn();
    render(<NumberInput value={2} showStepper step={5} min={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange.mock.calls[0][0].target.value).toBe('0');
  });

  it('disables Decrease button when value is at min', () => {
    render(<NumberInput value={0} showStepper min={0} onChange={() => {}} />);
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
  });

  it('disables Increase button when value is at max', () => {
    render(<NumberInput value={10} showStepper max={10} onChange={() => {}} />);
    expect(screen.getByLabelText('Increase')).toBeDisabled();
  });

  it('disables both steppers when disabled prop is true', () => {
    render(<NumberInput value={5} showStepper disabled onChange={() => {}} />);
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
    expect(screen.getByLabelText('Increase')).toBeDisabled();
  });

  it('disables the input itself when disabled', () => {
    render(<NumberInput value={5} disabled onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('sets aria-valuenow, aria-valuemin, and aria-valuemax on the input', () => {
    render(<NumberInput value={5} min={0} max={10} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-valuenow', '5');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '10');
  });

  it('handles empty value (no aria-valuenow)', () => {
    render(<NumberInput value="" onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    expect(input).not.toHaveAttribute('aria-valuenow');
  });

  it('handles undefined value (no aria-valuenow)', () => {
    render(<NumberInput onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    expect(input).not.toHaveAttribute('aria-valuenow');
  });

  it('treats empty/undefined value as 0 when stepping', () => {
    const onChange = vi.fn();
    render(<NumberInput value="" showStepper onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange.mock.calls[0][0].target.value).toBe('1');
  });

  it('calls onChange on direct input change', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
