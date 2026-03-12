<script lang="ts">
  interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  interface Props {
    variant?: 'standard' | 'truncated';
    items?: BreadcrumbItem[];
    separator?: string;
    maxItems?: number;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'standard',
    items = [],
    separator = '/',
    maxItems,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-breadcrumb',
      `uds-breadcrumb--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let displayItems = $derived(() => {
    if (variant === 'truncated' && maxItems && items.length > maxItems) {
      const first = items.slice(0, 1);
      const last = items.slice(-(maxItems - 1));
      return [...first, { label: '...', href: undefined }, ...last];
    }
    return items;
  });
</script>

<nav class={classes} aria-label="Breadcrumb" {...rest}>
  <ol class="uds-breadcrumb__list">
    {#each displayItems() as item, i}
      <li class="uds-breadcrumb__item">
        {#if i > 0}
          <span class="uds-breadcrumb__separator" aria-hidden="true">{separator}</span>
        {/if}
        {#if item.href && i < displayItems().length - 1}
          <a class="uds-breadcrumb__link" href={item.href}>{item.label}</a>
        {:else}
          <span class="uds-breadcrumb__current" aria-current={i === displayItems().length - 1 ? 'page' : undefined}>{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
