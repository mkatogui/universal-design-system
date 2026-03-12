import React from 'react';

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta?: React.ReactNode;
  highlighted?: boolean;
}

export interface PricingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: '2-column' | '3-column' | '4-column' | 'toggle';
  size?: 'standard' | 'compact';
  plans: PricingPlan[];
  billingToggle?: boolean;
  billingPeriod?: 'monthly' | 'annual';
  onBillingChange?: (period: 'monthly' | 'annual') => void;
  highlightedPlan?: string;
}

export const Pricing = React.forwardRef<HTMLDivElement, PricingProps>(
  ({ variant = '3-column', size = 'standard', plans, billingToggle, billingPeriod = 'monthly', onBillingChange, highlightedPlan, className, children, ...props }, ref) => {
    const classes = [
      'uds-pricing',
      `uds-pricing--${variant}`,
      `uds-pricing--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {billingToggle && (
          <div className="uds-pricing__toggle">
            <button
              className={['uds-pricing__toggle-btn', billingPeriod === 'monthly' && 'uds-pricing__toggle-btn--active'].filter(Boolean).join(' ')}
              onClick={() => onBillingChange?.('monthly')}
              aria-label="Monthly billing"
              aria-pressed={billingPeriod === 'monthly'}
              type="button"
            >
              Monthly
            </button>
            <button
              className={['uds-pricing__toggle-btn', billingPeriod === 'annual' && 'uds-pricing__toggle-btn--active'].filter(Boolean).join(' ')}
              onClick={() => onBillingChange?.('annual')}
              aria-label="Annual billing"
              aria-pressed={billingPeriod === 'annual'}
              type="button"
            >
              Annual
            </button>
          </div>
        )}
        <div className="uds-pricing__grid">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={[
                'uds-pricing__plan',
                (plan.highlighted || plan.name === highlightedPlan) && 'uds-pricing__plan--highlighted',
              ].filter(Boolean).join(' ')}
            >
              <h3 className="uds-pricing__plan-name">{plan.name}</h3>
              <div className="uds-pricing__plan-price">
                {plan.price}
                {plan.period && <span className="uds-pricing__plan-period">/{plan.period}</span>}
              </div>
              <ul className="uds-pricing__features">
                {plan.features.map((feature, i) => (
                  <li key={i} className="uds-pricing__feature">{feature}</li>
                ))}
              </ul>
              {plan.cta && <div className="uds-pricing__cta">{plan.cta}</div>}
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  }
);

Pricing.displayName = 'Pricing';
