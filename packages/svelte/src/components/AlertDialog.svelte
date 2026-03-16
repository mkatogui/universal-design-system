<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    variant?: 'info' | 'warning' | 'destructive';
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    open,
    onClose,
    onConfirm,
    variant = 'info',
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    class: className = '',
    ...rest
  }: Props = $props();

  let cancelRef: HTMLButtonElement;
  const id = $props.id?.() ?? Math.random().toString(36).slice(2);
  const titleId = `uds-alert-dialog-title-${id}`;
  const descId = `uds-alert-dialog-desc-${id}`;

  let classes = $derived(
    ['uds-alert-dialog', `uds-alert-dialog--${variant}`, className]
      .filter(Boolean)
      .join(' ')
  );

  let confirmBtnClass = $derived(
    `uds-btn uds-btn--${variant === 'destructive' ? 'destructive' : 'primary'} uds-btn--md`
  );

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => {
        cancelRef?.focus();
      });
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }

  function handleConfirm() {
    onConfirm();
    onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <svelte:portal target="body">
    <div class="uds-alert-dialog-overlay">
      <div
        class={classes}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        {...rest}
      >
        <div class="uds-alert-dialog__header">
          <h2 id={titleId} class="uds-alert-dialog__title">{title}</h2>
        </div>
        <div class="uds-alert-dialog__body">
          <p id={descId} class="uds-alert-dialog__description">{description}</p>
        </div>
        <div class="uds-alert-dialog__footer">
          <button
            bind:this={cancelRef}
            class="uds-btn uds-btn--secondary uds-btn--md"
            onclick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            class={confirmBtnClass}
            onclick={handleConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </svelte:portal>
{/if}
