<script lang="ts">
  interface Props {
    ratio?: '16/9' | '1/1' | '4/3';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    ratio = '16/9',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let ratioClass = $derived(`uds-aspect-ratio--${ratio.replace('/', '-')}`);

  let classes = $derived(
    ['uds-aspect-ratio', ratioClass, className].filter(Boolean).join(' ')
  );
</script>

<div class={classes} style:aspect-ratio={ratio} {...rest}>
  {@render children?.()}
</div>
