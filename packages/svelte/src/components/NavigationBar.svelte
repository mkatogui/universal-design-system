<script lang="ts">
  interface Props {
    variant?: 'standard' | 'minimal' | 'dark' | 'transparent';
    sticky?: boolean;
    blurOnScroll?: boolean;
    megaMenu?: boolean;
    darkModeToggle?: boolean;
    mobileOpen?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    ctaButton?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'standard',
    sticky = false,
    blurOnScroll = false,
    megaMenu = false,
    darkModeToggle = false,
    mobileOpen = false,
    class: className = '',
    children,
    ctaButton,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-navbar',
      `uds-navbar--${variant}`,
      sticky && 'uds-navbar--sticky',
      blurOnScroll && 'uds-navbar--blur',
      mobileOpen && 'uds-navbar--mobile-open',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<nav class={classes} aria-label="Main navigation" {...rest}>
  {@render children?.()}
  {#if ctaButton}
    <div class="uds-navbar__cta">
      {@render ctaButton()}
    </div>
  {/if}
  <button
    class="uds-navbar__mobile-toggle"
    aria-expanded={mobileOpen}
    aria-label="Toggle navigation menu"
  >
    <span class="uds-navbar__hamburger" aria-hidden="true"></span>
  </button>
</nav>
