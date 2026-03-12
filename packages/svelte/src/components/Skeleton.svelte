<script lang="ts">
  interface Props {
    variant?: 'text' | 'card' | 'avatar' | 'table';
    size?: 'sm' | 'md' | 'lg';
    lines?: number;
    animated?: boolean;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'text',
    size = 'md',
    lines = 3,
    animated = true,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-skeleton',
      `uds-skeleton--${variant}`,
      `uds-skeleton--${size}`,
      animated && 'uds-skeleton--animated',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={classes} aria-hidden="true" {...rest}>
  {#if variant === 'text'}
    {#each Array(lines) as _, i}
      <div class="uds-skeleton__line" style:width={i === lines - 1 ? '60%' : '100%'}></div>
    {/each}
  {:else if variant === 'card'}
    <div class="uds-skeleton__image"></div>
    <div class="uds-skeleton__line" style:width="80%"></div>
    <div class="uds-skeleton__line" style:width="60%"></div>
  {:else if variant === 'avatar'}
    <div class="uds-skeleton__circle"></div>
  {:else if variant === 'table'}
    {#each Array(lines) as _}
      <div class="uds-skeleton__row">
        <div class="uds-skeleton__cell"></div>
        <div class="uds-skeleton__cell"></div>
        <div class="uds-skeleton__cell"></div>
      </div>
    {/each}
  {/if}
</div>
