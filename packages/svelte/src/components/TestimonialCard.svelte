<script lang="ts">
  interface Props {
    variant?: 'quote-card' | 'video' | 'metric' | 'carousel';
    size?: 'sm' | 'md' | 'lg';
    quote?: string;
    avatar?: string;
    name?: string;
    title?: string;
    company?: string;
    rating?: number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'quote-card',
    size = 'md',
    quote = '',
    avatar,
    name = '',
    title: jobTitle = '',
    company = '',
    rating,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-testimonial',
      `uds-testimonial--${variant}`,
      `uds-testimonial--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<blockquote class={classes} {...rest}>
  {#if quote}
    <p class="uds-testimonial__quote">{quote}</p>
  {/if}
  {@render children?.()}
  <footer class="uds-testimonial__footer">
    {#if avatar}
      <img class="uds-testimonial__avatar" src={avatar} alt={name} />
    {/if}
    <div class="uds-testimonial__attribution">
      {#if name}
        <cite class="uds-testimonial__name">{name}</cite>
      {/if}
      {#if jobTitle || company}
        <span class="uds-testimonial__role">
          {jobTitle}{#if jobTitle && company}, {/if}{company}
        </span>
      {/if}
    </div>
    {#if rating != null}
      <div class="uds-testimonial__rating" aria-label={`${rating} out of 5 stars`}>
        {#each Array(5) as _, i}
          <span class="uds-testimonial__star" class:uds-testimonial__star--filled={i < rating} aria-hidden="true">
            {i < rating ? '\u2605' : '\u2606'}
          </span>
        {/each}
      </div>
    {/if}
  </footer>
</blockquote>
