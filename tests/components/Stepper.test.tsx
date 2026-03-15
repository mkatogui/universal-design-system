import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from '../../packages/react/src/components/Stepper/Stepper';

const steps = [
  { id: '1', label: 'Details' },
  { id: '2', label: 'Review' },
  { id: '3', label: 'Complete' },
];

describe('Stepper', () => {
  it('renders with BEM root class and aria-label', () => {
    const { container } = render(<Stepper steps={steps} />);
    const nav = container.querySelector('nav.uds-stepper');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Progress');
  });

  it('renders all step labels', () => {
    render(<Stepper steps={steps} />);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('marks active step with aria-current="step"', () => {
    render(<Stepper steps={steps} activeStep={1} />);
    const current = screen.getByText('Review').closest('[aria-current="step"]');
    expect(current).toBeInTheDocument();
  });

  it('applies orientation modifier', () => {
    const { container } = render(<Stepper steps={steps} orientation="vertical" />);
    expect(container.querySelector('.uds-stepper')).toHaveClass('uds-stepper--vertical');
  });

  it('calls onChange when a step is clicked (non-linear allows going back)', () => {
    const onChange = vi.fn();
    render(<Stepper steps={steps} activeStep={2} linear={false} onChange={onChange} />);
    const step1 = screen.getByText('Details').closest('[role="button"]');
    expect(step1).toBeInTheDocument();
    fireEvent.click(step1!);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('renders optional label when step has optional', () => {
    const stepsWithOptional = [
      { id: '1', label: 'Step 1' },
      { id: '2', label: 'Step 2', optional: true },
    ];
    render(<Stepper steps={stepsWithOptional} />);
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });
});
