import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
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
});
