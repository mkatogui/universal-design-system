<script lang="ts">
  interface MenuItem {
    id: string;
    label: string;
    href?: string;
    disabled?: boolean;
  }

  interface Props {
    items: MenuItem[];
    orientation?: 'horizontal' | 'vertical';
    activeItemId?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    items,
    orientation = 'horizontal',
    activeItemId,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-menu', `uds-menu--${orientation}`, className].filter(Boolean).join(' ')
  );
</script>

<nav class={classes} aria-label="Menu" {...rest}>
  {#each items as item}
    <div role="none">
      {#if item.href}
        <a
          href={item.href}
          role="menuitem"
          class="uds-menu__item{activeItemId === item.id ? ' uds-menu__item--active' : ''}"
          aria-current={activeItemId === item.id ? 'page' : undefined}
          aria-disabled={item.disabled}
        >
          {item.label}
        </a>
      {:else}
        <span
          role="menuitem"
          tabindex={0}
          class="uds-menu__item{activeItemId === item.id ? ' uds-menu__item--active' : ''}"
          aria-disabled={item.disabled}
        >
          {item.label}
        </span>
      {/if}
    </div>
  {/each}
</nav>
