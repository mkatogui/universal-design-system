<script lang="ts">
  interface Props {
    variant?: 'centered' | 'product-screenshot' | 'video-bg' | 'gradient-mesh' | 'search-forward' | 'split';
    size?: 'full' | 'compact';
    headline?: string;
    subheadline?: string;
    class?: string;
    children?: import('svelte').Snippet;
    cta?: import('svelte').Snippet;
    socialProof?: import('svelte').Snippet;
    visual?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'centered',
    size = 'full',
    headline = '',
    subheadline = '',
    class: className = '',
    children,
    cta,
    socialProof,
    visual,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-hero',
      `uds-hero--${variant}`,
      `uds-hero--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<section class={classes} {...rest}>
  <div class="uds-hero__content">
    {#if headline}
      <h1 class="uds-hero__headline">{headline}</h1>
    {/if}
    {#if subheadline}
      <p class="uds-hero__subheadline">{subheadline}</p>
    {/if}
    {#if cta}
      <div class="uds-hero__cta">
        {@render cta()}
      </div>
    {/if}
    {#if socialProof}
      <div class="uds-hero__social-proof">
        {@render socialProof()}
      </div>
    {/if}
    {@render children?.()}
  </div>
  {#if visual}
    <div class="uds-hero__visual">
      {@render visual()}
    </div>
  {/if}
</section>
