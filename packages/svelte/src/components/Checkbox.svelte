<script lang="ts">
  interface Props {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    label?: string;
    name?: string;
    value?: string;
    id?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    label = '',
    name,
    value,
    id,
    class: className = '',
    ...rest
  }: Props = $props();

  let checkboxId = $derived(id || `uds-checkbox-${Math.random().toString(36).slice(2, 9)}`);

  let classes = $derived(
    [
      'uds-checkbox',
      indeterminate && 'uds-checkbox--indeterminate',
      disabled && 'uds-checkbox--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function bindIndeterminate(node: HTMLInputElement) {
    $effect(() => {
      node.indeterminate = indeterminate;
    });
  }
</script>

<div class={classes}>
  <input
    class="uds-checkbox__input"
    type="checkbox"
    id={checkboxId}
    bind:checked
    {disabled}
    {name}
    {value}
    aria-checked={indeterminate ? 'mixed' : checked}
    use:bindIndeterminate
    {...rest}
  />
  {#if label}
    <label class="uds-checkbox__label" for={checkboxId}>{label}</label>
  {/if}
</div>
