<script lang="ts">
  interface Props {
    variant?: 'icon-top' | 'image-top' | 'horizontal' | 'stat-card' | 'dashboard-preview';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    description?: string;
    link?: string;
    image?: string;
    imageAlt?: string;
    class?: string;
    icon?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'icon-top',
    size = 'md',
    title = '',
    description = '',
    link,
    image,
    imageAlt = '',
    class: className = '',
    icon,
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-card',
      `uds-card--${variant}`,
      `uds-card--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} {...rest}>
  {#if icon}
    <div class="uds-card__icon">
      {@render icon()}
    </div>
  {/if}
  {#if image}
    <img class="uds-card__image" src={image} alt={imageAlt} />
  {/if}
  <div class="uds-card__body">
    {#if title}
      <h3 class="uds-card__title">{title}</h3>
    {/if}
    {#if description}
      <p class="uds-card__description">{description}</p>
    {/if}
    {@render children?.()}
  </div>
  {#if link}
    <a class="uds-card__link" href={link}>Learn more</a>
  {/if}
</div>
