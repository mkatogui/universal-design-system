<script lang="ts">
  interface ContextMenuItem {
    id: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    items: ContextMenuItem[];
    onSelect?: (id: string) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    items,
    onSelect,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let open = $state(false);
  let pos = $state({ x: 0, y: 0 });

  let classes = $derived(
    ['uds-context-menu', className].filter(Boolean).join(' ')
  );

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    pos = { x: event.clientX, y: event.clientY };
    open = true;
  }

  function selectItem(item: ContextMenuItem) {
    if (!item.disabled) {
      onSelect?.(item.id);
      open = false;
    }
  }

  $effect(() => {
    if (!open) return;
    function close() {
      open = false;
    }
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  });
</script>

<div
  class={classes}
  role="region"
  aria-label="Context menu trigger"
  oncontextmenu={handleContextMenu}
  {...rest}
>
  {@render children?.()}
  {#if open}
    <svelte:portal target="body">
      <div
        class="uds-context-menu__menu"
        role="menu"
        style:position="fixed"
        style:left="{pos.x}px"
        style:top="{pos.y}px"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
      >
        {#each items as item (item.id)}
          <button
            type="button"
            role="menuitem"
            class="uds-context-menu__item"
            disabled={item.disabled}
            onclick={() => selectItem(item)}
          >
            {item.label}
          </button>
        {/each}
      </div>
    </svelte:portal>
  {/if}
</div>
