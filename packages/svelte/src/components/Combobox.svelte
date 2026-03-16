<script lang="ts">
  interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    label: string;
    options: ComboboxOption[];
    value?: string | string[];
    onSelect: (value: string | string[]) => void;
    placeholder?: string;
    variant?: 'autocomplete' | 'multiselect' | 'creatable';
    errorText?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    [key: string]: any;
  }

  let {
    label,
    options,
    value,
    onSelect,
    placeholder = 'Search...',
    variant = 'autocomplete',
    errorText,
    disabled = false,
    size = 'md',
    class: className = '',
    ...rest
  }: Props = $props();

  let query = $state('');
  let isOpen = $state(false);
  let activeIndex = $state(-1);
  let inputRef: HTMLInputElement;
  let listboxRef: HTMLDivElement;

  const baseId = Math.random().toString(36).slice(2);
  const listboxId = `uds-combobox-listbox-${baseId}`;
  const labelId = `uds-combobox-label-${baseId}`;
  const inputId = `uds-combobox-input-${baseId}`;
  const errorId = `uds-combobox-error-${baseId}`;

  function sanitizeId(val: string): string {
    return val.replaceAll(/[^a-zA-Z0-9\-_]/g, '_');
  }

  let filtered = $derived(
    options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
  );

  let selectedValues = $derived(
    Array.isArray(value) ? value : value ? [value] : []
  );

  let classes = $derived(
    [
      'uds-combobox',
      `uds-combobox--${variant}`,
      `uds-combobox--${size}`,
      errorText && 'uds-combobox--error',
      disabled && 'uds-combobox--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let activeDescendant = $derived(
    activeIndex >= 0 && filtered[activeIndex]
      ? `${listboxId}-opt-${sanitizeId(filtered[activeIndex].value)}`
      : undefined
  );

  function handleSelect(optionValue: string) {
    if (variant === 'multiselect') {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelect(next);
    } else {
      onSelect(optionValue);
      isOpen = false;
      query = options.find((o) => o.value === optionValue)?.label ?? '';
    }
  }

  function handleCreate() {
    if (variant === 'creatable' && query.trim()) {
      onSelect(query.trim());
      isOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (isOpen) {
        activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      } else {
        isOpen = true;
        activeIndex = 0;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex] && !filtered[activeIndex].disabled) {
        handleSelect(filtered[activeIndex].value);
      } else if (variant === 'creatable' && filtered.length === 0) {
        handleCreate();
      }
    } else if (event.key === 'Escape') {
      isOpen = false;
      activeIndex = -1;
    }
  }

  function handleInput(event: Event) {
    query = (event.target as HTMLInputElement).value;
    activeIndex = -1;
    isOpen = true;
  }

  function handleFocus() {
    isOpen = true;
  }

  $effect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef && !inputRef.contains(e.target as Node) &&
        listboxRef && !listboxRef.contains(e.target as Node)
      ) {
        isOpen = false;
        activeIndex = -1;
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div class={classes} {...rest}>
  <label id={labelId} for={inputId} class="uds-combobox__label">
    {label}
  </label>
  <div class="uds-combobox__input-wrapper">
    <input
      bind:this={inputRef}
      id={inputId}
      class="uds-combobox__input"
      type="text"
      value={query}
      oninput={handleInput}
      onfocus={handleFocus}
      onkeydown={handleKeydown}
      {placeholder}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-labelledby={labelId}
      aria-activedescendant={activeDescendant}
      aria-invalid={errorText ? true : undefined}
      aria-describedby={errorText ? errorId : undefined}
      {disabled}
    />
  </div>
  {#if isOpen}
    <div
      bind:this={listboxRef}
      id={listboxId}
      class="uds-combobox__listbox"
      role="listbox"
      aria-labelledby={labelId}
      aria-multiselectable={variant === 'multiselect' ? true : undefined}
    >
      {#each filtered as option, index (option.value)}
        <div
          id={`${listboxId}-opt-${sanitizeId(option.value)}`}
          class={[
            'uds-combobox__option',
            index === activeIndex && 'uds-combobox__option--active',
            option.disabled && 'uds-combobox__option--disabled',
            selectedValues.includes(option.value) && 'uds-combobox__option--selected',
          ]
            .filter(Boolean)
            .join(' ')}
          role="option"
          tabindex="-1"
          aria-selected={selectedValues.includes(option.value)}
          aria-disabled={option.disabled}
          onclick={() => { if (!option.disabled) handleSelect(option.value); }}
          onkeydown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !option.disabled) {
              e.preventDefault();
              handleSelect(option.value);
            }
          }}
        >
          {option.label}
        </div>
      {/each}
      {#if filtered.length === 0 && variant === 'creatable' && query.trim()}
        <div
          class="uds-combobox__option uds-combobox__option--create"
          role="option"
          tabindex="-1"
          aria-selected={false}
          onclick={handleCreate}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCreate();
            }
          }}
        >
          Create &ldquo;{query.trim()}&rdquo;
        </div>
      {/if}
      {#if filtered.length === 0 && variant !== 'creatable'}
        <div class="uds-combobox__empty">No results found</div>
      {/if}
    </div>
  {/if}
  {#if errorText}
    <div id={errorId} class="uds-combobox__error" role="alert">
      {errorText}
    </div>
  {/if}
</div>
