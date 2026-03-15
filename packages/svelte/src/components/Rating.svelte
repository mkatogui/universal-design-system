<script lang="ts">
  interface Props {
    value?: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onChange?: (v: number) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value = 0,
    max = 5,
    size = 'md',
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props();

  let classes = $derived(['uds-rating', `uds-rating--${size}`, className].filter(Boolean).join(' '));
</script>

<div class={classes} role="group" aria-label="Rating {value} of {max}">
  {#each Array(max) as _, i}
    {@const starValue = i + 1}
    <button
      type="button"
      class="uds-rating__star"
      class:uds-rating__star--filled={value >= starValue}
      aria-label="{starValue} star{starValue > 1 ? 's' : ''}"
      {disabled}
      onclick={() => onChange?.(starValue)}
    >
      <span aria-hidden="true">{value >= starValue ? '★' : '☆'}</span>
    </button>
  {/each}
</div>
