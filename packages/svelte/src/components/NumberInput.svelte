<script lang="ts">
  interface Props {
    value?: number | string;
    min?: number;
    max?: number;
    step?: number;
    showStepper?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onChange?: (v: number | string) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value = '',
    min,
    max,
    step = 1,
    showStepper = false,
    size = 'md',
    disabled = false,
    onChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-number-input',
      `uds-number-input--${size}`,
      showStepper && 'uds-number-input--stepper',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleStep(delta: number) {
    const next = (Number(value) || 0) + delta;
    const clamped = min != null && next < min ? min : max != null && next > max ? max : next;
    onChange?.(clamped);
  }
</script>

<div class={classes}>
  {#if showStepper}
    <button
      type="button"
      class="uds-number-input__stepper uds-number-input__stepper--minus"
      aria-label="Decrease"
      disabled={disabled || (min != null && Number(value) <= min)}
      onclick={() => handleStep(-step)}
    >
      −
    </button>
  {/if}
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    {disabled}
    class="uds-number-input__input"
    aria-valuenow={value !== '' && value !== undefined ? Number(value) : undefined}
    aria-valuemin={min}
    aria-valuemax={max}
    oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
    {...rest}
  />
  {#if showStepper}
    <button
      type="button"
      class="uds-number-input__stepper uds-number-input__stepper--plus"
      aria-label="Increase"
      disabled={disabled || (max != null && Number(value) >= max)}
      onclick={() => handleStep(step)}
    >
      +
    </button>
  {/if}
</div>
