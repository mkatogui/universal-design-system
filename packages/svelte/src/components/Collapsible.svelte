<script lang="ts">
  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: import('svelte').Snippet;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    open: controlledOpen = false,
    onOpenChange,
    trigger,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let internalOpen = $state(false);
  let isControlled = $derived(onOpenChange !== undefined);
  let isOpen = $derived(isControlled ? controlledOpen : internalOpen);

  const id = Math.random().toString(36).slice(2);
  const contentId = `uds-collapsible-${id}-content`;

  let classes = $derived(
    ['uds-collapsible', className].filter(Boolean).join(' ')
  );

  function toggle() {
    const next = !isOpen;
    if (!isControlled) internalOpen = next;
    onOpenChange?.(next);
  }
</script>

<div class={classes} {...rest}>
  <button
    type="button"
    aria-expanded={isOpen}
    aria-controls={contentId}
    onclick={toggle}
    class="uds-collapsible__trigger"
  >
    {@render trigger?.()}
  </button>
  <section
    id={contentId}
    class="uds-collapsible__content"
    hidden={!isOpen}
    aria-hidden={!isOpen}
  >
    {@render children?.()}
  </section>
</div>
