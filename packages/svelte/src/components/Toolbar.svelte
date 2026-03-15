<script lang="ts">
  interface Props {
    'aria-label': string;
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    'aria-label': ariaLabel,
    orientation = 'horizontal',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-toolbar',
      orientation === 'vertical' && 'uds-toolbar--vertical',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} role="toolbar" aria-label={ariaLabel} {...rest}>
  {@render children?.()}
</div>
