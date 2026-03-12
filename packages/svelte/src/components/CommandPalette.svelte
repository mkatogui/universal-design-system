<script lang="ts">
  interface CommandAction {
    id: string;
    label: string;
    group?: string;
    shortcut?: string;
    icon?: string;
  }

  interface Props {
    open?: boolean;
    actions?: CommandAction[];
    groups?: string[];
    placeholder?: string;
    recentLimit?: number;
    onSelect?: (actionId: string) => void;
    onClose?: () => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = false,
    actions = [],
    groups = [],
    placeholder = 'Type a command...',
    recentLimit = 5,
    onSelect,
    onClose,
    class: className = '',
    ...rest
  }: Props = $props();

  let query = $state('');
  let activeIndex = $state(0);

  let classes = $derived(
    [
      'uds-command-palette',
      open && 'uds-command-palette--open',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let filteredActions = $derived(
    query
      ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
      : actions.slice(0, recentLimit)
  );

  let groupedActions = $derived(() => {
    if (groups.length === 0) return [{ group: '', actions: filteredActions }];
    const grouped: { group: string; actions: CommandAction[] }[] = [];
    for (const group of groups) {
      const items = filteredActions.filter((a) => a.group === group);
      if (items.length > 0) grouped.push({ group, actions: items });
    }
    const ungrouped = filteredActions.filter((a) => !a.group || !groups.includes(a.group));
    if (ungrouped.length > 0) grouped.push({ group: '', actions: ungrouped });
    return grouped;
  });

  function handleSelect(action: CommandAction) {
    onSelect?.(action.id);
    query = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredActions.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (event.key === 'Enter' && filteredActions[activeIndex]) {
      event.preventDefault();
      handleSelect(filteredActions[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    }
  }

  $effect(() => {
    activeIndex = 0;
  });
</script>

{#if open}
  <div class="uds-command-palette__overlay" onclick={onClose} aria-hidden="true"></div>
  <div class={classes} role="dialog" aria-label="Command palette" {...rest}>
    <div class="uds-command-palette__input-wrapper">
      <input
        class="uds-command-palette__input"
        type="text"
        bind:value={query}
        {placeholder}
        role="combobox"
        aria-expanded="true"
        aria-controls="command-palette-list"
        aria-activedescendant={filteredActions[activeIndex] ? `command-${filteredActions[activeIndex].id}` : undefined}
        onkeydown={handleKeydown}
      />
    </div>
    <ul class="uds-command-palette__list" id="command-palette-list" role="listbox">
      {#each groupedActions() as group}
        {#if group.group}
          <li class="uds-command-palette__group-label" role="presentation">{group.group}</li>
        {/if}
        {#each group.actions as action, i}
          <li
            class="uds-command-palette__item"
            class:uds-command-palette__item--active={filteredActions.indexOf(action) === activeIndex}
            id="command-{action.id}"
            role="option"
            aria-selected={filteredActions.indexOf(action) === activeIndex}
            onclick={() => handleSelect(action)}
          >
            <span class="uds-command-palette__item-label">{action.label}</span>
            {#if action.shortcut}
              <kbd class="uds-command-palette__shortcut">{action.shortcut}</kbd>
            {/if}
          </li>
        {/each}
      {/each}
      {#if filteredActions.length === 0}
        <li class="uds-command-palette__empty" role="presentation">No results found</li>
      {/if}
    </ul>
  </div>
{/if}
