<script lang="ts">
  interface Props {
    columns?: 1 | 2 | 3 | 4 | 12;
    gap?: 'sm' | 'md' | 'lg';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let { columns = 1, gap = 'md', class: className = '', children, ...rest }: Props = $props();

  let classes = $derived(
    ['uds-grid', `uds-grid--cols-${columns}`, `uds-grid--gap-${gap}`, className].filter(Boolean).join(' ')
  );
</script>

<div class={classes} {...rest}>
  {@render children?.()}
</div>
