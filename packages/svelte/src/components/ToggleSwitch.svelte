<script lang="ts">
  interface Props {
    variant?: 'standard' | 'with-label';
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string;
    class?: string;
    onChange?: (checked: boolean) => void;
    [key: string]: any;
  }

  let {
    variant = 'standard',
    checked = $bindable(false),
    disabled = false,
    label = '',
    id,
    class: className = '',
    onChange,
    ...rest
  }: Props = $props();

  let toggleId = $derived(id || `uds-toggle-${Math.random().toString(36).slice(2, 9)}`);

  let classes = $derived(
    [
      'uds-toggle',
      `uds-toggle--${variant}`,
      checked && 'uds-toggle--on',
      disabled && 'uds-toggle--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleChange() {
    checked = !checked;
    onChange?.(checked);
  }
</script>

<div class={classes}>
  <button
    class="uds-toggle__switch"
    id={toggleId}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label || undefined}
    {disabled}
    onclick={handleChange}
    {...rest}
  >
    <span class="uds-toggle__thumb" aria-hidden="true"></span>
  </button>
  {#if variant === 'with-label' && label}
    <label class="uds-toggle__label" for={toggleId}>{label}</label>
  {/if}
</div>
