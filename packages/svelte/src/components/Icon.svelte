<script lang="ts">
  interface Props {
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    /** When true, sets aria-hidden (decorative). @default true */
    decorative?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    name,
    size = 'md',
    color,
    decorative = true,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-icon', `uds-icon--${size}`, className].filter(Boolean).join(' ')
  );

  let style = $derived(color ? `color: ${color}` : undefined);
</script>

{#if decorative}
  <span class={classes} style={style} aria-hidden="true" {...rest}>
    {#if children}
      {@render children()}
    {:else if name}
      <span class="uds-icon__symbol">{name}</span>
    {/if}
  </span>
{:else}
  <span class={classes} style={style} role="img" aria-label={name} {...rest}>
    {#if children}
      {@render children()}
    {:else if name}
      <span class="uds-icon__symbol">{name}</span>
    {/if}
  </span>
{/if}
