<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'full';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let { size = 'lg', class: className = '', children, ...rest }: Props = $props();

  let classes = $derived(['uds-container', `uds-container--${size}`, className].filter(Boolean).join(' '));
</script>

<div class={classes} {...rest}>
  {@render children?.()}
</div>
