<script lang="ts">
  interface Props {
    padding?: string | number;
    margin?: string | number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let { padding, margin, class: className = '', children, ...rest }: Props = $props();

  let classes = $derived(['uds-box', className].filter(Boolean).join(' '));

  let styleObj = $derived.by(() => {
    const s: Record<string, string> = {};
    if (padding != null)
      s.padding = typeof padding === 'number' ? `${padding}px` : `var(--space-${padding}, ${padding})`;
    if (margin != null)
      s.margin = typeof margin === 'number' ? `${margin}px` : `var(--space-${margin}, ${margin})`;
    return s;
  });
</script>

<div class={classes} style={Object.keys(styleObj).length ? styleObj : undefined} {...rest}>
  {@render children?.()}
</div>
