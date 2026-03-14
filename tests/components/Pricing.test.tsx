import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Pricing } from '../../packages/react/src/components/Pricing/Pricing';

const plans = [
  { name: 'Free', price: '$0', period: 'mo', features: ['1 project', '1 GB storage'] },
  {
    name: 'Pro',
    price: '$29',
    period: 'mo',
    features: ['Unlimited projects', '10 GB storage'],
    cta: <button type="button">Get Pro</button>,
    highlighted: true,
  },
  { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'SSO'] },
];

describe('Pricing', () => {
  it('renders plan names, prices, and features', () => {
    render(<Pricing plans={plans} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('1 project')).toBeInTheDocument();
    expect(screen.getByText('Unlimited projects')).toBeInTheDocument();
  });

  it('renders a highlighted plan with the highlighted class', () => {
    const { container } = render(<Pricing plans={plans} />);
    const highlightedCards = container.querySelectorAll('.uds-pricing__plan--highlighted');
    expect(highlightedCards).toHaveLength(1);
  });

  it('highlights a plan by name via highlightedPlan prop', () => {
    const plainPlans = [
      { name: 'Starter', price: '$0', features: ['Basic'] },
      { name: 'Business', price: '$49', features: ['Advanced'] },
    ];
    const { container } = render(<Pricing plans={plainPlans} highlightedPlan="Business" />);
    const highlightedCards = container.querySelectorAll('.uds-pricing__plan--highlighted');
    expect(highlightedCards).toHaveLength(1);
    expect(highlightedCards[0]).toHaveTextContent('Business');
  });

  it('renders plan CTA and period', () => {
    render(<Pricing plans={plans} />);
    expect(screen.getByRole('button', { name: 'Get Pro' })).toBeInTheDocument();
    const periods = screen.getAllByText('/mo');
    expect(periods.length).toBeGreaterThan(0);
  });

  it('renders billing toggle buttons and calls onBillingChange', () => {
    const handleChange = vi.fn();
    render(
      <Pricing
        plans={plans}
        billingToggle
        billingPeriod="monthly"
        onBillingChange={handleChange}
      />,
    );
    const monthlyBtn = screen.getByRole('button', { name: 'Monthly billing' });
    const annualBtn = screen.getByRole('button', { name: 'Annual billing' });
    expect(monthlyBtn).toHaveAttribute('aria-pressed', 'true');
    expect(annualBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(annualBtn);
    expect(handleChange).toHaveBeenCalledWith('annual');
  });

  it('applies variant and size modifier classes', () => {
    const { container } = render(<Pricing plans={plans} variant="2-column" size="compact" />);
    const root = container.querySelector('.uds-pricing');
    expect(root).toHaveClass('uds-pricing--2-column');
    expect(root).toHaveClass('uds-pricing--compact');
  });

  it('forwards a ref object to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Pricing plans={plans} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-pricing');
  });

  it('forwards a callback ref to the root div element', () => {
    const callbackRef = vi.fn();
    render(<Pricing plans={plans} ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it('calls onBillingChange with "monthly" when the monthly button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Pricing plans={plans} billingToggle billingPeriod="annual" onBillingChange={handleChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Monthly billing' }));
    expect(handleChange).toHaveBeenCalledWith('monthly');
  });
});
