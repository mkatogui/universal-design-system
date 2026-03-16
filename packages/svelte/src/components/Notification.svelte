<script lang="ts">
  interface NotificationItem {
    id: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  }

  interface Props {
    items: NotificationItem[];
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    onDismiss?: (id: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    items,
    position = 'top-right',
    onDismiss,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-notification', `uds-notification--${position}`, className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<section class={classes} aria-label="Notifications" {...rest}>
  {#each items as item (item.id)}
    <output
      class="uds-notification__item uds-notification__item--{item.variant ?? 'neutral'}"
      for=""
    >
      <span class="uds-notification__message">{item.message}</span>
      {#if onDismiss}
        <button
          type="button"
          class="uds-notification__dismiss"
          aria-label="Dismiss"
          onclick={() => onDismiss?.(item.id)}
        >
          &times;
        </button>
      {/if}
    </output>
  {/each}
</section>
