<script lang="ts">
  interface Props {
    id?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let { id, class: className = '', children, ...rest }: Props = $props();

  let classes = $derived(['uds-form', className].filter(Boolean).join(' '));
</script>

<form class={classes} {id} {...rest}>
  {@render children?.()}
</form>
