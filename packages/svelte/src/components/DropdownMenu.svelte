<script lang="ts">
  interface DropdownItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    separator?: boolean;
  }

  interface Props {
    variant?: 'action' | 'context' | 'nav-sub';
    size?: 'sm' | 'md' | 'lg';
    items?: DropdownItem[];
    position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    onSelect?: (itemId: string) => void;
    class?: string;
    trigger?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'action',
    size = 'md',
    items = [],
    position = 'bottom-start',
    onSelect,
    class: className = '',
    trigger,
    ...rest
  }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(-1);

  let classes = $derived(
    [
      'uds-dropdown',
      `uds-dropdown--${variant}`,
      `uds-dropdown--${size}`,
      `uds-dropdown--${position}`,
      open && 'uds-dropdown--open',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function toggleMenu() {
    open = !open;
    if (open) activeIndex = -1;
  }

  function selectItem(item: DropdownItem) {
    if (!item.disabled && !item.separator) {
      onSelect?.(item.id);
      open = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open) return;
    const enabledItems = items.filter((item) => !item.disabled && !item.separator);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % enabledItems.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + enabledItems.length) % enabledItems.length;
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectItem(enabledItems[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      open = false;
    }
  }
</script>

<div class={classes} onkeydown={handleKeydown} {...rest}>
  <button
    class="uds-dropdown__trigger"
    aria-haspopup="true"
    aria-expanded={open}
    onclick={toggleMenu}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      Menu
    {/if}
  </button>
  {#if open}
    <ul class="uds-dropdown__menu" role="menu">
      {#each items as item, i}
        {#if item.separator}
          <li class="uds-dropdown__separator" role="separator"></li>
        {:else}
          <li
            class="uds-dropdown__item"
            class:uds-dropdown__item--disabled={item.disabled}
            class:uds-dropdown__item--active={i === activeIndex}
            role="menuitem"
            aria-disabled={item.disabled || undefined}
            onclick={() => selectItem(item)}
          >
            {item.label}
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
