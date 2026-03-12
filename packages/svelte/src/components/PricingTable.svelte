<script lang="ts">
  interface PricingPlan {
    name: string;
    price: string;
    period?: string;
    features: string[];
    cta?: string;
    highlighted?: boolean;
  }

  interface Props {
    variant?: '2-column' | '3-column' | '4-column' | 'toggle';
    size?: 'standard' | 'compact';
    plans?: PricingPlan[];
    highlightedPlan?: string;
    billingPeriod?: 'monthly' | 'annual';
    onToggle?: (period: string) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = '3-column',
    size = 'standard',
    plans = [],
    highlightedPlan,
    billingPeriod = 'monthly',
    onToggle,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-pricing',
      `uds-pricing--${variant}`,
      `uds-pricing--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} {...rest}>
  {#if variant === 'toggle'}
    <div class="uds-pricing__toggle" role="group" aria-label="Billing period">
      <button
        class="uds-pricing__toggle-btn"
        class:uds-pricing__toggle-btn--active={billingPeriod === 'monthly'}
        onclick={() => onToggle?.('monthly')}
      >
        Monthly
      </button>
      <button
        class="uds-pricing__toggle-btn"
        class:uds-pricing__toggle-btn--active={billingPeriod === 'annual'}
        onclick={() => onToggle?.('annual')}
      >
        Annual
      </button>
    </div>
  {/if}
  <div class="uds-pricing__plans">
    {#each plans as plan}
      <div
        class="uds-pricing__plan"
        class:uds-pricing__plan--highlighted={plan.highlighted || plan.name === highlightedPlan}
      >
        <h3 class="uds-pricing__plan-name">{plan.name}</h3>
        <div class="uds-pricing__plan-price">{plan.price}</div>
        {#if plan.period}
          <div class="uds-pricing__plan-period">{plan.period}</div>
        {/if}
        <ul class="uds-pricing__features">
          {#each plan.features as feature}
            <li class="uds-pricing__feature">{feature}</li>
          {/each}
        </ul>
        {#if plan.cta}
          <button class="uds-pricing__cta">{plan.cta}</button>
        {/if}
      </div>
    {/each}
  </div>
  {@render children?.()}
</div>
