<script lang="ts">
  interface Props {
    variant?: 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    message?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'info',
    size = 'md',
    title = '',
    message = '',
    dismissible = false,
    onDismiss,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let dismissed = $state(false);

  let alertRole = $derived(
    variant === 'error' || variant === 'warning' ? 'alert' : 'status'
  );

  let classes = $derived(
    [
      'uds-alert',
      `uds-alert--${variant}`,
      `uds-alert--${size}`,
      dismissed && 'uds-alert--dismissing',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleDismiss() {
    dismissed = true;
    onDismiss?.();
  }
</script>

{#if !dismissed}
  <div class={classes} role={alertRole} {...rest}>
    <div class="uds-alert__content">
      {#if title}
        <p class="uds-alert__title">{title}</p>
      {/if}
      {#if message}
        <p class="uds-alert__message">{message}</p>
      {/if}
      {@render children?.()}
    </div>
    {#if dismissible}
      <button class="uds-alert__dismiss" onclick={handleDismiss} aria-label="Dismiss alert">
        <span aria-hidden="true">&times;</span>
      </button>
    {/if}
  </div>
{/if}
