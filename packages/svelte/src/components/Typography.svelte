<script lang="ts">
  type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'code';

  interface Props {
    variant?: Variant;
    as?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let { variant = 'body', as, class: className = '', children, ...rest }: Props = $props();

  const tagMap: Record<Variant, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    caption: 'span',
    code: 'code',
  };
  let tag = $derived(as ?? tagMap[variant]);

  let classes = $derived(
    ['uds-typography', `uds-typography--${variant}`, className].filter(Boolean).join(' ')
  );
</script>

<svelte:element this={tag} class={classes} {...rest}>
  {@render children?.()}
</svelte:element>
