<script lang="ts">
  interface Props {
    value?: string[];
    defaultValue?: string[];
    onChange?: (chips: string[]) => void;
    onAdd?: (chip: string) => void;
    onRemove?: (index: number) => void;
    maxChips?: number;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value: controlledValue,
    defaultValue = [],
    onChange,
    onAdd,
    onRemove,
    maxChips,
    placeholder = 'Add...',
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let internalValue = $state<string[]>([...defaultValue]);
  let inputValue = $state('');

  let chips = $derived(controlledValue ?? internalValue);

  let classes = $derived(
    ['uds-chip-input', disabled && 'uds-chip-input--disabled', className].filter(Boolean).join(' ')
  );

  function updateChips(next: string[]) {
    if (controlledValue === undefined) internalValue = next;
    onChange?.(next);
  }

  function handleAdd() {
    const trimmed = inputValue.trim();
    if (!trimmed || (maxChips != null && chips.length >= maxChips)) return;
    if (chips.includes(trimmed)) return;
    updateChips([...chips, trimmed]);
    onAdd?.(trimmed);
    inputValue = '';
  }

  function handleRemove(index: number) {
    updateChips(chips.filter((_, i) => i !== index));
    onRemove?.(index);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      handleRemove(chips.length - 1);
    }
  }
</script>

<div class={classes} role="listbox" aria-label="Chips" aria-disabled={disabled} {...rest}>
  {#each chips as chip, index}
    <span class="uds-chip-input__chip" role="option">
      <span class="uds-chip-input__chip-label">{chip}</span>
      <button
        type="button"
        class="uds-chip-input__chip-remove"
        aria-label="Remove {chip}"
        disabled={disabled}
        onclick={() => handleRemove(index)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </span>
  {/each}
  {#if maxChips == null || chips.length < maxChips}
    <input
      type="text"
      class="uds-chip-input__input"
      placeholder={placeholder}
      aria-label="Add chip"
      disabled={disabled}
      bind:value={inputValue}
      onkeydown={handleKeydown}
    />
  {/if}
</div>
