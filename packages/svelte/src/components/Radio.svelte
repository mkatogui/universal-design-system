<script lang="ts">
  interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    variant?: 'standard' | 'card';
    options?: RadioOption[];
    name?: string;
    value?: string;
    legend?: string;
    disabled?: boolean;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'standard',
    options = [],
    name = '',
    value = $bindable(''),
    legend = '',
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let groupId = $derived(`uds-radio-${Math.random().toString(36).slice(2, 9)}`);

  let classes = $derived(
    [
      'uds-radio',
      `uds-radio--${variant}`,
      disabled && 'uds-radio--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<fieldset class={classes} {...rest}>
  {#if legend}
    <legend class="uds-radio__legend">{legend}</legend>
  {/if}
  {#each options as option, i}
    <div class="uds-radio__option" class:uds-radio__option--card={variant === 'card'}>
      <input
        class="uds-radio__input"
        type="radio"
        id="{groupId}-{i}"
        {name}
        value={option.value}
        checked={value === option.value}
        disabled={disabled || option.disabled}
        aria-checked={value === option.value}
        onchange={() => (value = option.value)}
      />
      <label class="uds-radio__label" for="{groupId}-{i}">{option.label}</label>
    </div>
  {/each}
</fieldset>
