<script lang="ts">
  interface Props {
    /** Display variant. @default 'bar' */
    variant?: 'bar' | 'circular' | 'stepper';
    /** Controls dimensions and stroke width. @default 'md' */
    size?: 'sm' | 'md' | 'lg';
    /** Current progress value. @default 0 */
    value?: number;
    /** Maximum value (the value at 100%). @default 100 */
    max?: number;
    /** Accessible label for the progress indicator. */
    label?: string;
    /** Show a numeric percentage alongside the indicator. */
    showValue?: boolean;
    /** Render an indeterminate (unknown-duration) animation. */
    indeterminate?: boolean;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'bar',
    size = 'md',
    value = 0,
    max = 100,
    label,
    showValue = false,
    indeterminate = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let percentage = $derived(
    Math.min(100, Math.max(0, (value / max) * 100))
  );

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

  let radius = $derived(size === 'sm' ? 16 : size === 'lg' ? 28 : 22);
  let circumference = $derived(2 * Math.PI * radius);
  let offset = $derived(indeterminate ? 0 : circumference - (percentage / 100) * circumference);
  let svgSize = $derived((radius + 4) * 2);
</script>

{#if variant === 'circular'}
  <div
    class={classes}
    role="progressbar"
    aria-valuenow={indeterminate ? undefined : value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label={label}
    {...rest}
  >
    <svg
      class="uds-progress__svg"
      width={svgSize}
      height={svgSize}
      viewBox="0 0 {svgSize} {svgSize}"
      aria-hidden="true"
    >
      <title>Progress indicator</title>
      <circle
        class="uds-progress__track"
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke-width="4"
      />
      <circle
        class="uds-progress__fill"
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke-width="4"
        stroke-dasharray={circumference}
        stroke-dashoffset={offset}
        stroke-linecap="round"
      />
    </svg>
    {#if showValue && !indeterminate}
      <span class="uds-progress__value">{Math.round(percentage)}%</span>
    {/if}
  </div>
{:else}
  <div
    class={classes}
    role="progressbar"
    aria-valuenow={indeterminate ? undefined : value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label={label}
    {...rest}
  >
    {#if label}
      <span class="uds-progress__label">{label}</span>
    {/if}
    <div class="uds-progress__track">
      <div
        class="uds-progress__fill"
        style={indeterminate ? undefined : `width: ${percentage}%`}
      ></div>
    </div>
    {#if showValue && !indeterminate}
      <span class="uds-progress__value">{Math.round(percentage)}%</span>
    {/if}
  </div>
{/if}
