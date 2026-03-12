<script lang="ts">
  interface FooterColumn {
    title: string;
    links: { label: string; href: string }[];
  }

  interface Props {
    variant?: 'simple' | 'multi-column' | 'newsletter' | 'mega-footer';
    size?: 'standard' | 'compact';
    columns?: FooterColumn[];
    copyright?: string;
    class?: string;
    children?: import('svelte').Snippet;
    newsletter?: import('svelte').Snippet;
    legal?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'simple',
    size = 'standard',
    columns = [],
    copyright = '',
    class: className = '',
    children,
    newsletter,
    legal,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-footer',
      `uds-footer--${variant}`,
      `uds-footer--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<footer class={classes} aria-label="Site footer" {...rest}>
  {#if columns.length > 0}
    <div class="uds-footer__columns">
      {#each columns as column}
        <div class="uds-footer__column">
          <h3 class="uds-footer__column-title">{column.title}</h3>
          <ul class="uds-footer__link-list">
            {#each column.links as link}
              <li><a href={link.href}>{link.label}</a></li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
  {#if newsletter}
    <div class="uds-footer__newsletter">
      {@render newsletter()}
    </div>
  {/if}
  {@render children?.()}
  {#if legal}
    <div class="uds-footer__legal">
      {@render legal()}
    </div>
  {/if}
  {#if copyright}
    <div class="uds-footer__copyright">{copyright}</div>
  {/if}
</footer>
