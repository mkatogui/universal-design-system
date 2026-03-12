<script lang="ts">
  interface NavItem {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    children?: NavItem[];
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  interface Props {
    variant?: 'default' | 'collapsed' | 'with-sections';
    collapsed?: boolean;
    items?: NavItem[];
    sections?: NavSection[];
    activeItem?: string;
    onNavigate?: (itemId: string) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'default',
    collapsed = false,
    items = [],
    sections = [],
    activeItem = '',
    onNavigate,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let expandedItems = $state<Set<string>>(new Set());

  let classes = $derived(
    [
      'uds-side-nav',
      `uds-side-nav--${variant}`,
      collapsed && 'uds-side-nav--collapsed',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function toggleExpand(id: string) {
    if (expandedItems.has(id)) {
      expandedItems.delete(id);
    } else {
      expandedItems.add(id);
    }
    expandedItems = new Set(expandedItems);
  }

  function handleNavigate(item: NavItem) {
    onNavigate?.(item.id);
  }
</script>

<nav class={classes} aria-label="Side navigation" {...rest}>
  {#if variant === 'with-sections' && sections.length > 0}
    {#each sections as section}
      <div class="uds-side-nav__section">
        <h3 class="uds-side-nav__section-title">{section.title}</h3>
        <ul class="uds-side-nav__list">
          {#each section.items as item}
            <li class="uds-side-nav__item" class:uds-side-nav__item--active={activeItem === item.id}>
              <a
                class="uds-side-nav__link"
                href={item.href || '#'}
                aria-current={activeItem === item.id ? 'page' : undefined}
                onclick={(e) => { if (!item.href) e.preventDefault(); handleNavigate(item); }}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  {:else}
    <ul class="uds-side-nav__list">
      {#each items as item}
        <li class="uds-side-nav__item" class:uds-side-nav__item--active={activeItem === item.id}>
          {#if item.children && item.children.length > 0}
            <button
              class="uds-side-nav__link uds-side-nav__link--expandable"
              aria-expanded={expandedItems.has(item.id)}
              onclick={() => toggleExpand(item.id)}
            >
              {item.label}
            </button>
            {#if expandedItems.has(item.id)}
              <ul class="uds-side-nav__sublist">
                {#each item.children as child}
                  <li class="uds-side-nav__item" class:uds-side-nav__item--active={activeItem === child.id}>
                    <a
                      class="uds-side-nav__link"
                      href={child.href || '#'}
                      aria-current={activeItem === child.id ? 'page' : undefined}
                      onclick={(e) => { if (!child.href) e.preventDefault(); handleNavigate(child); }}
                    >
                      {child.label}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <a
              class="uds-side-nav__link"
              href={item.href || '#'}
              aria-current={activeItem === item.id ? 'page' : undefined}
              onclick={(e) => { if (!item.href) e.preventDefault(); handleNavigate(item); }}
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {@render children?.()}
</nav>
