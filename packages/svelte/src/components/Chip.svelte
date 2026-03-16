<script lang="ts">
  interface Props {
    label: string;
    onRemove?: () => void;
    variant?: 'default' | 'outlined' | 'removable';
    size?: 'sm' | 'md';
    class?: string;
    [key: string]: any;
  }

  let {
    label,
    onRemove,
    variant = 'default',
    size = 'md',
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-chip',
      `uds-chip--${variant}`,
      `uds-chip--${size}`,
      onRemove && 'uds-chip--removable',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<span class={classes} role="listitem" {...rest}>
  <span class="uds-chip__label">{label}</span>
  {#if onRemove}
    <button
      type="button"
      class="uds-chip__remove"
      aria-label={`Remove ${label}`}
      onclick={onRemove}
    >
      &times;
    </button>
  {/if}
</span>
