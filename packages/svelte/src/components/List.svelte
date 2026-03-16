<script lang="ts">
  interface Props {
    variant?: 'bullet' | 'numbered' | 'none';
    dense?: boolean;
    items?: string[];
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'bullet',
    dense = false,
    items,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-list',
      `uds-list--${variant}`,
      dense && 'uds-list--dense',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

{#if variant === 'numbered'}
  <ol class={classes} {...rest}>
    {#if items}
      {#each items as item}
        <li class="uds-list__item">{item}</li>
      {/each}
    {:else}
      {@render children?.()}
    {/if}
  </ol>
{:else}
  <ul class={classes} {...rest}>
    {#if items}
      {#each items as item}
        <li class="uds-list__item">{item}</li>
      {/each}
    {:else}
      {@render children?.()}
    {/if}
  </ul>
{/if}
