<script lang="ts">
  interface Props {
    variant?: 'bar' | 'circular' | 'stepper';
    size?: 'sm' | 'md' | 'lg';
    value?: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    indeterminate?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'bar',
    size = 'md',
    value = 0,
    max = 100,
    label = '',
    showValue = false,
    indeterminate = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let percentage = $derived(Math.min(Math.round((value / max) * 100), 100));

  let classes = $derived(
    [
      'uds-progress',
      `uds-progress--${variant}`,
      `uds-progress--${size}`,
      indeterminate && 'uds-progress--indeterminate',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let circumference = $derived(2 * Math.PI * 40);
  let strokeOffset = $derived(circumference - (percentage / 100) * circumference);
</script>

<div
  class={classes}
  role="progressbar"
  aria-valuenow={indeterminate ? undefined : value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label={label || undefined}
  {...rest}
>
  {#if variant === 'bar'}
    <div class="uds-progress__track">
      <div class="uds-progress__fill" style:width={indeterminate ? undefined : `${percentage}%`}></div>
    </div>
    {#if showValue && !indeterminate}
      <span class="uds-progress__value">{percentage}%</span>
    {/if}
  {:else if variant === 'circular'}
    <svg class="uds-progress__svg" viewBox="0 0 100 100">
      <circle class="uds-progress__track-circle" cx="50" cy="50" r="40" fill="none" stroke-width="8" />
      {#if !indeterminate}
        <circle
          class="uds-progress__fill-circle"
          cx="50" cy="50" r="40"
          fill="none"
          stroke-width="8"
          stroke-dasharray={circumference}
          stroke-dashoffset={strokeOffset}
          transform="rotate(-90 50 50)"
        />
      {/if}
    </svg>
    {#if showValue && !indeterminate}
      <span class="uds-progress__value">{percentage}%</span>
    {/if}
  {:else if variant === 'stepper'}
    {@render children?.()}
  {/if}
  {#if label}
    <span class="uds-progress__label">{label}</span>
  {/if}
</div>
