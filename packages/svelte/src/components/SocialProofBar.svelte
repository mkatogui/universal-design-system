<script lang="ts">
  interface Logo {
    src: string;
    alt: string;
    href?: string;
  }

  interface Stat {
    value: string;
    label: string;
  }

  interface Testimonial {
    quote: string;
    author: string;
  }

  interface Props {
    variant?: 'logo-strip' | 'stats-counter' | 'testimonial-mini' | 'combined';
    size?: 'standard' | 'compact';
    logos?: Logo[];
    stats?: Stat[];
    testimonials?: Testimonial[];
    animated?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'logo-strip',
    size = 'standard',
    logos = [],
    stats = [],
    testimonials = [],
    animated = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-social-proof',
      `uds-social-proof--${variant}`,
      `uds-social-proof--${size}`,
      animated && 'uds-social-proof--animated',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} {...rest}>
  {#if logos.length > 0}
    <div class="uds-social-proof__logos">
      {#each logos as logo}
        {#if logo.href}
          <a href={logo.href} class="uds-social-proof__logo-link">
            <img src={logo.src} alt={logo.alt} class="uds-social-proof__logo" />
          </a>
        {:else}
          <img src={logo.src} alt={logo.alt} class="uds-social-proof__logo" />
        {/if}
      {/each}
    </div>
  {/if}
  {#if stats.length > 0}
    <div class="uds-social-proof__stats">
      {#each stats as stat}
        <div class="uds-social-proof__stat">
          <span class="uds-social-proof__stat-value">{stat.value}</span>
          <span class="uds-social-proof__stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>
  {/if}
  {#if testimonials.length > 0}
    <div class="uds-social-proof__testimonials">
      {#each testimonials as testimonial}
        <blockquote class="uds-social-proof__testimonial">
          <p>{testimonial.quote}</p>
          <cite>{testimonial.author}</cite>
        </blockquote>
      {/each}
    </div>
  {/if}
  {@render children?.()}
</div>
