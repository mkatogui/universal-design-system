<script lang="ts">
  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    size?: 'sm' | 'md';
    class?: string;
    trigger?: import('svelte').Snippet<[{ open: boolean }]>;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    open: controlledOpen,
    onOpenChange,
    placement = 'bottom',
    size = 'md',
    class: className = '',
    trigger,
    children,
    ...rest
  }: Props = $props();

  let internalOpen = $state(false);
  let open = $derived(controlledOpen ?? internalOpen);

  let contentRef: HTMLDivElement;
  let triggerRef: HTMLDivElement;
  let contentStyle = $state<Record<string, string>>({ position: 'fixed', left: '0', top: '0', zIndex: '9999' });

  $effect(() => {
    if (open && contentRef && triggerRef) {
      const tr = triggerRef.getBoundingClientRect();
      const cr = contentRef.getBoundingClientRect();
      let top = tr.bottom + 8;
      let left = tr.left + (tr.width - cr.width) / 2;
      if (placement === 'top') top = tr.top - cr.height - 8;
      left = Math.max(8, Math.min(window.innerWidth - cr.width - 8, left));
      top = Math.max(8, Math.min(window.innerHeight - cr.height - 8, top));
      contentStyle = { position: 'fixed', left: `${left}px`, top: `${top}px`, zIndex: '9999' };
    }
  });

  let classes = $derived(
    ['uds-popover', `uds-popover--${size}`, `uds-popover--${placement}`, className].filter(Boolean).join(' ')
  );

  function setOpen(v: boolean) {
    if (controlledOpen === undefined) internalOpen = v;
    onOpenChange?.(v);
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
  }
</script>

<svelte:window onkeydown={handleEscape} />

<div class="uds-popover__wrapper" {...rest}>
  <div bind:this={triggerRef} onclick={() => setOpen(!open)}>
    {@render trigger?.({ open })}
  </div>
</div>

{#if open}
  <svelte:portal target="body">
    <div
      bind:this={contentRef}
      class={classes}
      role="dialog"
      aria-modal="false"
      style={contentStyle}
    >
      <div class="uds-popover__content">
        {@render children?.()}
      </div>
    </div>
  </svelte:portal>
{/if}
