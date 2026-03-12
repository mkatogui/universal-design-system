<script lang="ts">
  interface Props {
    variant?: 'status' | 'count' | 'tag';
    size?: 'sm' | 'md';
    label?: string;
    color?: string;
    removable?: boolean;
    onRemove?: () => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'status',
    size = 'md',
    label = '',
    color,
    removable = false,
    onRemove,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-badge',
      `uds-badge--${variant}`,
      `uds-badge--${size}`,
      color && `uds-badge--${color}`,
      removable && 'uds-badge--removable',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<span class={classes} aria-label={label || undefined} {...rest}>
  {#if label}
    {label}
  {/if}
  {@render children?.()}
  {#if removable}
    <button class="uds-badge__remove" onclick={onRemove} aria-label="Remove {label}">
      <span aria-hidden="true">&times;</span>
    </button>
  {/if}
</span>
