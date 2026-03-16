<script lang="ts">
  interface Props {
    /** Section heading (e.g. "Contact details", "Payment"). */
    title: string;
    /** Optional description shown below the title. */
    description?: string;
    /** Heading level for the title. @default 2 */
    titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    title,
    description,
    titleLevel = 2,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-form-section', className].filter(Boolean).join(' ')
  );
</script>

<div class={classes} {...rest}>
  {#if titleLevel === 1}
    <h1 class="uds-form-section__title">{title}</h1>
  {:else if titleLevel === 2}
    <h2 class="uds-form-section__title">{title}</h2>
  {:else if titleLevel === 3}
    <h3 class="uds-form-section__title">{title}</h3>
  {:else if titleLevel === 4}
    <h4 class="uds-form-section__title">{title}</h4>
  {:else if titleLevel === 5}
    <h5 class="uds-form-section__title">{title}</h5>
  {:else}
    <h6 class="uds-form-section__title">{title}</h6>
  {/if}
  {#if description}
    <p class="uds-form-section__description">{description}</p>
  {/if}
  {#if children}
    <div class="uds-form-section__fields">
      {@render children()}
    </div>
  {/if}
</div>
