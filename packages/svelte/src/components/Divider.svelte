<script lang="ts">
  interface Props {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'line' | 'dashed';
    class?: string;
    [key: string]: unknown;
  }

  let {
    orientation = 'horizontal',
    variant = 'line',
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-divider',
      `uds-divider--${orientation}`,
      variant === 'dashed' && 'uds-divider--dashed',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<hr class={classes} role="separator" {...rest} />
