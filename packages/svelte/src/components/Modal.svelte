<script lang="ts">
  interface Props {
    variant?: 'confirmation' | 'task' | 'alert';
    size?: 'sm' | 'md' | 'lg';
    open?: boolean;
    title?: string;
    onClose?: () => void;
    class?: string;
    children?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'confirmation',
    size = 'md',
    open = false,
    title = '',
    onClose,
    class: className = '',
    children,
    actions,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-modal',
      `uds-modal--${variant}`,
      `uds-modal--${size}`,
      open && 'uds-modal--open',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      onClose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="uds-modal__overlay" onclick={onClose} aria-hidden="true"></div>
  <div class={classes} role="dialog" aria-modal="true" aria-label={title} {...rest}>
    <div class="uds-modal__header">
      {#if title}
        <h2 class="uds-modal__title">{title}</h2>
      {/if}
      <button class="uds-modal__close" onclick={onClose} aria-label="Close dialog">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="uds-modal__body">
      {@render children?.()}
    </div>
    {#if actions}
      <div class="uds-modal__actions">
        {@render actions()}
      </div>
    {/if}
  </div>
{/if}
