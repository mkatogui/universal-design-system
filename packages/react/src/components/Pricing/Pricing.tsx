import React from 'react';

/**
 * Describes a single pricing tier shown inside the {@link Pricing} grid.
 */
export interface PricingPlan {
  /** Plan display name (e.g. "Pro"). */
  name: string;
  /** Price string (e.g. "$29"). */
  price: string;
  /** Billing period label (e.g. "mo"). */
  period?: string;
  /** List of features included in this plan. */
  features: string[];
  /** CTA element rendered below the feature list. */
  cta?: React.ReactNode;
  /** Visually highlight this plan as recommended. */
  highlighted?: boolean;
}

/**
 * Props for the {@link Pricing} component.
 *
 * Extends native `<div>` attributes.
 */
export interface PricingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid layout variant. @default '3-column' */
  variant?: '2-column' | '3-column' | '4-column' | 'toggle';
  /** Density of plan cards. @default 'standard' */
  size?: 'standard' | 'compact';
  /** Array of plan definitions to render. */
  plans: PricingPlan[];
  /** Show a monthly/annual billing toggle above the grid. */
  billingToggle?: boolean;
  /** Currently selected billing period. @default 'monthly' */
  billingPeriod?: 'monthly' | 'annual';
  /** Called when the user switches billing period. */
  onBillingChange?: (period: 'monthly' | 'annual') => void;
  /** Name of the plan to visually highlight. */
  highlightedPlan?: string;
}

/**
 * A pricing comparison grid that renders multiple {@link PricingPlan} cards
 * with an optional monthly/annual billing toggle.
 *
 * Uses BEM class `uds-pricing` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Pricing
 *   plans={[
 *     { name: 'Free', price: '$0', features: ['1 project'] },
 *     { name: 'Pro',  price: '$29', features: ['Unlimited'], highlighted: true },
 *   ]}
 * />
 * ```
 */
export const Pricing = React.forwardRef<HTMLDivElement, PricingProps>(
  (
    {
      variant = '3-column',
      size = 'standard',
      plans,
      billingToggle,
      billingPeriod = 'monthly',
      onBillingChange,
      highlightedPlan,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = ['uds-pricing', `uds-pricing--${variant}`, `uds-pricing--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {billingToggle && (
          <div className="uds-pricing__toggle">
            <button
              className={[
                'uds-pricing__toggle-btn',
                billingPeriod === 'monthly' && 'uds-pricing__toggle-btn--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onBillingChange?.('monthly')}
              aria-label="Monthly billing"
              aria-pressed={billingPeriod === 'monthly'}
              type="button"
            >
              Monthly
            </button>
            <button
              className={[
                'uds-pricing__toggle-btn',
                billingPeriod === 'annual' && 'uds-pricing__toggle-btn--active',
              ]
                .filter(Boolean)
                .join(' ')}
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
                (plan.highlighted || plan.name === highlightedPlan) &&
                  'uds-pricing__plan--highlighted',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <h3 className="uds-pricing__plan-name">{plan.name}</h3>
              <div className="uds-pricing__plan-price">
                {plan.price}
                {plan.period && <span className="uds-pricing__plan-period">/{plan.period}</span>}
              </div>
              <ul className="uds-pricing__features">
                {plan.features.map((feature, i) => (
                  <li key={i} className="uds-pricing__feature">
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.cta && <div className="uds-pricing__cta">{plan.cta}</div>}
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  },
);

Pricing.displayName = 'Pricing';
