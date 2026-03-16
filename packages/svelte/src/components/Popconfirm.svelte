<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    open: controlledOpen,
    onOpenChange,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let internalOpen = $state(false);

  let isControlled = $derived(controlledOpen !== undefined);
  let isOpen = $derived(isControlled ? controlledOpen! : internalOpen);

  function setOpen(v: boolean) {
    if (!isControlled) internalOpen = v;
    onOpenChange?.(v);
  }

  let anchorEl: HTMLButtonElement | undefined = $state();
  let position = $state({ top: 0, left: 0 });

  let classes = $derived(
    ['uds-popconfirm', className].filter(Boolean).join(' ')
  );

  // Update position when open changes
  $effect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      position = { top: rect.bottom + 8, left: rect.left };
    }
  });

  // Close on outside click
  $effect(() => {
    if (!isOpen) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  });

  function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  function handleCancel() {
    onCancel?.();
    setOpen(false);
  }

  function handlePanelClick(e: MouseEvent) {
    e.stopPropagation();
  }

  function handlePanelKeydown(e: KeyboardEvent) {
    e.stopPropagation();
  }
</script>

<div class={classes} {...rest}>
  <button
    type="button"
    bind:this={anchorEl}
    onclick={() => setOpen(true)}
    class="uds-popconfirm__trigger"
  >
    {@render children?.()}
  </button>
</div>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="uds-popconfirm__panel"
    role="dialog"
    aria-describedby="uds-popconfirm-desc"
    style="position: fixed; top: {position.top}px; left: {position.left}px;"
    onclick={handlePanelClick}
    onkeydown={handlePanelKeydown}
  >
    <p class="uds-popconfirm__title">{title}</p>
    {#if description}
      <p id="uds-popconfirm-desc" class="uds-popconfirm__description">
        {description}
      </p>
    {/if}
    <div class="uds-popconfirm__actions">
      <button type="button" class="uds-popconfirm__cancel" onclick={handleCancel}>
        {cancelLabel}
      </button>
      <button type="button" class="uds-popconfirm__confirm" onclick={handleConfirm}>
        {confirmLabel}
      </button>
    </div>
  </div>
{/if}
