<script lang="ts">
  interface Props {
    href: string;
    variant?: 'default' | 'muted' | 'primary';
    external?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    href,
    variant = 'primary',
    external = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(['uds-link', `uds-link--${variant}`, className].filter(Boolean).join(' '));
  let rel = $derived(external ? 'noopener noreferrer' : undefined);
  let target = $derived(external ? '_blank' : undefined);
</script>

<a class={classes} {href} {rel} {target} {...rest}>
  {@render children?.()}
</a>
