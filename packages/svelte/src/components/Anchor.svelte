<script lang="ts">
  interface AnchorItem {
    href: string;
    title: string;
  }

  interface Props {
    items: AnchorItem[];
    smoothScroll?: boolean;
    class?: string;
    [key: string]: any;
  }

  let {
    items,
    smoothScroll = true,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-anchor', className].filter(Boolean).join(' ')
  );
</script>

<nav class={classes} aria-label="On this page" {...rest}>
  <ul style:list-style="none" style:padding="0" style:margin="0">
    {#each items as item (item.href)}
      <li>
        <a
          href={item.href}
          style:scroll-behavior={smoothScroll ? 'smooth' : undefined}
          class="uds-anchor__link"
        >
          {item.title}
        </a>
      </li>
    {/each}
  </ul>
</nav>
