<script lang="ts">
  interface Props {
    value: string | number;
    label?: string;
    prefix?: import('svelte').Snippet;
    suffix?: import('svelte').Snippet;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label,
    prefix,
    suffix,
    size = 'md',
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-statistic', `uds-statistic--${size}`, className].filter(Boolean).join(' ')
  );
</script>

<div class={classes} {...rest}>
  {#if label}
    <span class="uds-statistic__label">{label}</span>
  {/if}
  <div class="uds-statistic__value">
    {#if prefix}
      <span class="uds-statistic__prefix">{@render prefix()}</span>
    {/if}
    <span class="uds-statistic__number">{value}</span>
    {#if suffix}
      <span class="uds-statistic__suffix">{@render suffix()}</span>
    {/if}
  </div>
</div>
