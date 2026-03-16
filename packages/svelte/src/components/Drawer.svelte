<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    side?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    open,
    onClose,
    side = 'right',
    size = 'md',
    title,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let drawerRef: HTMLDialogElement;

  let classes = $derived(
    ['uds-drawer', `uds-drawer--${side}`, `uds-drawer--${size}`, className]
      .filter(Boolean)
      .join(' ')
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (drawerRef && !drawerRef.contains(event.target as Node)) {
      onClose();
    }
  }

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const focusable = drawerRef?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      });
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <svelte:portal target="body">
    <div class="uds-drawer-overlay" onmousedown={handleOverlayClick}>
      <dialog
        bind:this={drawerRef}
        class={classes}
        open
        aria-modal="true"
        aria-label={title}
        {...rest}
      >
        {#if title}
          <div class="uds-drawer__header">
            <h2 class="uds-drawer__title">{title}</h2>
            <button
              class="uds-drawer__close"
              onclick={onClose}
              aria-label="Close drawer"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/if}
        <div class="uds-drawer__body">
          {@render children?.()}
        </div>
      </dialog>
    </div>
  </svelte:portal>
{/if}
