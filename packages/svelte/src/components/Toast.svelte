<script lang="ts">
  interface Props {
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    duration?: number;
    action?: string;
    onDismiss?: () => void;
    onAction?: () => void;
    visible?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'info',
    size = 'md',
    message = '',
    duration = 5000,
    action,
    onDismiss,
    onAction,
    visible = true,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let state = $state<'entering' | 'visible' | 'exiting'>('entering');

  let toastRole = $derived(
    variant === 'error' || variant === 'warning' ? 'alert' : 'status'
  );

  let classes = $derived(
    [
      'uds-toast',
      `uds-toast--${variant}`,
      `uds-toast--${size}`,
      `uds-toast--${state}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  $effect(() => {
    if (!visible) return;
    const enterTimer = setTimeout(() => (state = 'visible'), 50);
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    if (duration > 0) {
      exitTimer = setTimeout(() => {
        state = 'exiting';
        setTimeout(() => onDismiss?.(), 300);
      }, duration);
    }
    return () => {
      clearTimeout(enterTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  });

  function handleDismiss() {
    state = 'exiting';
    setTimeout(() => onDismiss?.(), 300);
  }
</script>

{#if visible}
  <div class={classes} role={toastRole} {...rest}>
    <p class="uds-toast__message">{message}</p>
    {@render children?.()}
    <div class="uds-toast__actions">
      {#if action}
        <button class="uds-toast__action" onclick={onAction}>{action}</button>
      {/if}
      <button class="uds-toast__dismiss" onclick={handleDismiss} aria-label="Dismiss notification">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
{/if}
