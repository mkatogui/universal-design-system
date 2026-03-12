<script lang="ts">
  interface Props {
    variant?: 'single' | 'range' | 'with-time';
    size?: 'md' | 'lg';
    value?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    locale?: string;
    placeholder?: string;
    label?: string;
    id?: string;
    onChange?: (value: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'single',
    size = 'md',
    value = $bindable(''),
    min,
    max,
    disabled = false,
    locale = 'en-US',
    placeholder = 'Select date',
    label = '',
    id,
    onChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let pickerId = $derived(id || `uds-date-picker-${Math.random().toString(36).slice(2, 9)}`);

  let classes = $derived(
    [
      'uds-date-picker',
      `uds-date-picker--${variant}`,
      `uds-date-picker--${size}`,
      disabled && 'uds-date-picker--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let inputType = $derived(variant === 'with-time' ? 'datetime-local' : 'date');

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onChange?.(value);
  }
</script>

<div class={classes} {...rest}>
  {#if label}
    <label class="uds-date-picker__label" for={pickerId}>{label}</label>
  {/if}
  <input
    class="uds-date-picker__input"
    type={inputType}
    id={pickerId}
    {value}
    {min}
    {max}
    {disabled}
    {placeholder}
    aria-label={label || placeholder}
    onchange={handleChange}
  />
</div>
