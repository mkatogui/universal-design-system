<script lang="ts">
  interface Props {
    variant?: 'image' | 'initials' | 'icon' | 'group';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    src?: string;
    alt?: string;
    initials?: string;
    status?: 'online' | 'offline' | 'busy';
    fallback?: string;
    class?: string;
    icon?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'image',
    size = 'md',
    src,
    alt = '',
    initials = '',
    status,
    fallback,
    class: className = '',
    icon,
    children,
    ...rest
  }: Props = $props();

  let imgError = $state(false);

  let classes = $derived(
    [
      'uds-avatar',
      `uds-avatar--${variant}`,
      `uds-avatar--${size}`,
      status && `uds-avatar--${status}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

{#if variant === 'group'}
  <div class={classes} role="group" aria-label="User avatars" {...rest}>
    {@render children?.()}
  </div>
{:else}
  <div class={classes} {...rest}>
    {#if variant === 'image' && src && !imgError}
      <img class="uds-avatar__image" src={src} alt={alt} onerror={() => (imgError = true)} />
    {:else if variant === 'icon' && icon}
      <span class="uds-avatar__icon" aria-hidden="true">{@render icon()}</span>
    {:else}
      <span class="uds-avatar__initials" aria-label={alt || initials}>{initials || fallback || '?'}</span>
    {/if}
    {#if status}
      <span class="uds-avatar__status" aria-label={status}></span>
    {/if}
  </div>
{/if}
