<script lang="ts">
  interface Props {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    variant?: 'primary' | 'extended';
    size?: 'md' | 'lg';
    'aria-label': string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    position = 'bottom-right',
    variant = 'primary',
    size = 'md',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-float-button',
      `uds-float-button--${position}`,
      `uds-float-button--${variant}`,
      `uds-float-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<button type="button" class={classes} {...rest}>
  {@render children?.()}
</button>
