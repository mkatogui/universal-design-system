<script lang="ts">
  interface Props {
    src?: string;
    alt: string;
    fallback?: import('svelte').Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    src,
    alt,
    fallback,
    class: className = '',
    ...rest
  }: Props = $props();

  let errored = $state(false);

  let classes = $derived(
    ['uds-image', className].filter(Boolean).join(' ')
  );

  function handleError() {
    errored = true;
  }
</script>

{#if errored && fallback}
  <div class={classes}>
    {@render fallback()}
  </div>
{:else}
  <img {src} {alt} class={classes} loading="lazy" onerror={handleError} {...rest} />
{/if}
