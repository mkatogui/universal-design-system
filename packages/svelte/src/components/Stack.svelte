<script lang="ts">
  interface Props {
    direction?: 'row' | 'column';
    gap?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
    wrap?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    wrap = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-stack',
      `uds-stack--${direction}`,
      `uds-stack--gap-${gap}`,
      align !== 'stretch' && `uds-stack--align-${align}`,
      wrap && 'uds-stack--wrap',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} {...rest}>
  {@render children?.()}
</div>
