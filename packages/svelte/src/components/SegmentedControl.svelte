<script lang="ts">
  export interface SegmentedControlOption {
    value: string;
    label: string;
    icon?: import('svelte').Snippet;
  }

  interface Props {
    options: SegmentedControlOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    size?: 'sm' | 'md' | 'lg';
    iconOnly?: boolean;
    disabled?: boolean;
    class?: string;
    [key: string]: unknown;
  }

  let {
    options,
    value: controlledValue,
    defaultValue,
    onChange,
    size = 'md',
    iconOnly = false,
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let internalValue = $state(defaultValue ?? options[0]?.value ?? '');
  let value = $derived(controlledValue ?? internalValue);

  let classes = $derived(
    [
      'uds-segmented-control',
      `uds-segmented-control--${size}`,
      iconOnly && 'uds-segmented-control--icon-only',
      disabled && 'uds-segmented-control--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function select(optionValue: string) {
    if (disabled) return;
    if (controlledValue === undefined) internalValue = optionValue;
    onChange?.(optionValue);
  }

  function handleKeydown(e: KeyboardEvent, currentIndex: number) {
    if (disabled) return;
    let nextIndex = currentIndex;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = Math.max(0, currentIndex - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = Math.min(options.length - 1, currentIndex + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
    } else return;
    const nextValue = options[nextIndex]?.value;
    if (nextValue != null) select(nextValue);
  }
</script>

<div class={classes} role="radiogroup" aria-label="Options" aria-disabled={disabled} {...rest}>
  {#each options as option, index}
    <button
      type="button"
      role="radio"
      aria-checked={value === option.value}
      disabled={disabled}
      class="uds-segmented-control__option {value === option.value ? 'uds-segmented-control__option--selected' : ''}"
      onclick={() => select(option.value)}
      onkeydown={(e) => handleKeydown(e, index)}
    >
      {#if option.icon}
        <span class="uds-segmented-control__icon" aria-hidden="true">{@render option.icon()}</span>
      {/if}
      {#if !iconOnly}<span class="uds-segmented-control__label">{option.label}</span>{/if}
    </button>
  {/each}
</div>
