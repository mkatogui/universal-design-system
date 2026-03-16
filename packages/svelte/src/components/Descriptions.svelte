<script lang="ts">
  interface DescriptionsItem {
    label: string;
    value: string;
  }

  interface Props {
    items: DescriptionsItem[];
    layout?: 'horizontal' | 'vertical' | 'bordered';
    class?: string;
    [key: string]: any;
  }

  let {
    items,
    layout = 'horizontal',
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-descriptions', `uds-descriptions--${layout}`, className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<dl class={classes} {...rest}>
  {#each items as item (item.label)}
    <dt class="uds-descriptions__label">{item.label}</dt>
    <dd class="uds-descriptions__value">{item.value}</dd>
  {/each}
</dl>
