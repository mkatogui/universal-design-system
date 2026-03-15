<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onChange?: (v: number) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value,
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    disabled = false,
    onChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let val = $derived(value ?? min);
  let classes = $derived(['uds-slider', `uds-slider--${size}`, className].filter(Boolean).join(' '));
</script>

<div class={classes}>
  <input
    type="range"
    value={val}
    {min}
    {max}
    {step}
    {disabled}
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={val}
    class="uds-slider__input"
    oninput={(e) => onChange?.(Number((e.currentTarget as HTMLInputElement).value))}
    {...rest}
  />
</div>
