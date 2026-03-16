<script lang="ts">
  interface Props {
    title?: string;
    description?: string;
    class?: string;
    illustration?: import('svelte').Snippet;
    action?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    title = 'No data',
    description,
    class: className = '',
    illustration,
    action,
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-empty', className].filter(Boolean).join(' ')
  );
</script>

<output class={classes} aria-label={title} for="" {...rest}>
  {#if illustration}
    <div class="uds-empty__illustration">{@render illustration()}</div>
  {/if}
  <h3 class="uds-empty__title">{title}</h3>
  {#if description}
    <p class="uds-empty__description">{description}</p>
  {/if}
  {#if action}
    <div class="uds-empty__action">{@render action()}</div>
  {/if}
</output>
