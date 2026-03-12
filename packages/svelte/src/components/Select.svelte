<script lang="ts">
  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    variant?: 'native' | 'custom';
    size?: 'sm' | 'md' | 'lg';
    options?: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    errorText?: string;
    value?: string;
    id?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'native',
    size = 'md',
    options = [],
    placeholder = '',
    required = false,
    disabled = false,
    label = '',
    errorText = '',
    value = $bindable(''),
    id,
    class: className = '',
    ...rest
  }: Props = $props();

  let selectId = $derived(id || `uds-select-${Math.random().toString(36).slice(2, 9)}`);
  let errorId = $derived(`${selectId}-error`);
  let isError = $derived(!!errorText);

  let classes = $derived(
    [
      'uds-select',
      `uds-select--${variant}`,
      `uds-select--${size}`,
      isError && 'uds-select--error',
      disabled && 'uds-select--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes}>
  {#if label}
    <label class="uds-select__label" for={selectId}>
      {label}
      {#if required}
        <span class="uds-select__required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}
  <select
    class="uds-select__field"
    id={selectId}
    bind:value
    {required}
    {disabled}
    aria-invalid={isError || undefined}
    aria-describedby={errorText ? errorId : undefined}
    {...rest}
  >
    {#if placeholder}
      <option value="" disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>
  {#if errorText}
    <p class="uds-select__error" id={errorId} role="alert">{errorText}</p>
  {/if}
</div>
