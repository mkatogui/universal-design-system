<script lang="ts">
  interface DropdownItem {
    label: string;
    value: string;
    disabled?: boolean;
    icon?: string;
  }

  interface Props {
    variant?: 'action' | 'context' | 'nav-sub';
    size?: 'sm' | 'md' | 'lg';
    items: DropdownItem[];
    trigger?: import('svelte').Snippet;
    onSelect?: (value: string) => void;
    position?: 'bottom-start' | 'bottom-end';
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'action',
    size = 'md',
    items,
    trigger,
    onSelect,
    position = 'bottom-start',
    class: className = '',
    ...rest
  }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(-1);
  let menuRef: HTMLDivElement;
  let triggerRef: HTMLButtonElement;

  const menuId = `uds-dropdown-menu-${Math.random().toString(36).slice(2)}`;

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

  function close() {
    open = false;
    activeIndex = -1;
    triggerRef?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    const enabledIndices = items
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (open) {
        const pos = enabledIndices.indexOf(activeIndex);
        activeIndex = enabledIndices[(pos + 1) % enabledIndices.length];
      } else {
        open = true;
        activeIndex = enabledIndices[0] ?? -1;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const pos = enabledIndices.indexOf(activeIndex);
      activeIndex = enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open && activeIndex >= 0 && !items[activeIndex].disabled) {
        onSelect?.(items[activeIndex].value);
        close();
      } else {
        open = true;
        activeIndex = enabledIndices[0] ?? -1;
      }
    }
  }

  $effect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef && !menuRef.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div bind:this={menuRef} class={classes} role="none" onkeydown={handleKeydown} {...rest}>
  <button
    bind:this={triggerRef}
    class="uds-dropdown__trigger"
    type="button"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={menuId}
    onclick={() => { open = !open; }}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      Menu
    {/if}
  </button>
  {#if open}
    <div id={menuId} class="uds-dropdown__menu" role="menu">
      {#each items as item, index (item.value)}
        <button
          class={[
            'uds-dropdown__item',
            index === activeIndex && 'uds-dropdown__item--active',
          ]
            .filter(Boolean)
            .join(' ')}
          role="menuitem"
          type="button"
          disabled={item.disabled}
          tabindex="-1"
          onclick={() => {
            onSelect?.(item.value);
            close();
          }}
        >
          {#if item.icon}
            <span class="uds-dropdown__item-icon">{item.icon}</span>
          {/if}
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
