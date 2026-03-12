<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'destructive' | 'icon-only';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    class?: string;
    iconLeft?: import('svelte').Snippet;
    iconRight?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled = false,
    class: className = '',
    iconLeft,
    iconRight,
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-btn',
      `uds-btn--${variant}`,
      `uds-btn--${size}`,
      fullWidth && 'uds-btn--full-width',
      loading && 'uds-btn--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<button class={classes} disabled={disabled || loading} aria-busy={loading || undefined} aria-disabled={disabled || undefined} {...rest}>
  {#if loading}
    <span class="uds-btn__spinner" aria-hidden="true"></span>
  {/if}
  {#if iconLeft}
    <span class="uds-btn__icon-left">{@render iconLeft()}</span>
  {/if}
  {@render children?.()}
  {#if iconRight}
    <span class="uds-btn__icon-right">{@render iconRight()}</span>
  {/if}
</button>
