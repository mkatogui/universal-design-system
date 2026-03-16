<script lang="ts">
  interface Props {
    variant?: 'dropzone' | 'button' | 'avatar-upload';
    size?: 'sm' | 'md' | 'lg';
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    /** Accessible label for the upload zone. @default 'Upload files' */
    label?: string;
    /** Error message shown below the zone (e.g. validation from parent). Overrides internal error. */
    error?: string;
    /** Main placeholder text when no custom children. */
    placeholderTitle?: string;
    /** Optional second line in placeholder (e.g. accepted types or size limit). */
    placeholderDescription?: string;
    /** Label for the browse action in placeholder. @default 'browse' */
    acceptLabel?: string;
    onUpload?: (files: File[]) => void;
    onRemove?: (file: File) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'dropzone',
    size = 'md',
    accept,
    maxSize,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    label = 'Upload files',
    error: errorProp,
    placeholderTitle,
    placeholderDescription,
    acceptLabel = 'browse',
    onUpload,
    onRemove,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let dragOver = $state(false);
  let internalError = $state<string | null>(null);
  let inputId = $derived(`uds-file-upload-${Math.random().toString(36).slice(2, 9)}`);

  let displayError = $derived(errorProp ?? internalError);

  let classes = $derived(
    [
      'uds-file-upload',
      `uds-file-upload--${variant}`,
      `uds-file-upload--${size}`,
      dragOver && 'uds-file-upload--drag-over',
      disabled && 'uds-file-upload--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let placeholderText = $derived(
    placeholderTitle ??
      (variant === 'button'
        ? 'Choose file'
        : `Drag and drop files here, or click to ${acceptLabel}`)
  );

  function validateFiles(files: File[]): File[] {
    internalError = null;
    let valid = files;
    if (maxSize) {
      const oversized = valid.filter((f) => f.size > maxSize!);
      if (oversized.length > 0) {
        internalError = `File too large: ${oversized[0].name}`;
        valid = valid.filter((f) => f.size <= maxSize!);
      }
    }
    if (maxFiles) {
      valid = valid.slice(0, maxFiles);
    }
    return valid;
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    const valid = validateFiles(files);
    if (valid.length) {
      onUpload?.(valid);
    }
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    handleFiles(target.files);
    target.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    if (disabled) return;
    handleFiles(event.dataTransfer?.files || null);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function openFileDialog() {
    document.getElementById(inputId)?.click();
  }
</script>

<div class={classes} {...rest}>
  <input
    class="uds-file-upload__input"
    type="file"
    id={inputId}
    {accept}
    {multiple}
    {disabled}
    aria-label={label}
    onchange={handleFileChange}
    hidden
  />

  {#if variant === 'dropzone'}
    <button
      type="button"
      class="uds-file-upload__zone"
      aria-label={label}
      aria-disabled={disabled || undefined}
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={openFileDialog}
    >
      {#if children}
        {@render children()}
      {:else}
        <div class="uds-file-upload__placeholder">
          <p class="uds-file-upload__text">{placeholderText}</p>
          {#if placeholderDescription}
            <p class="uds-file-upload__sub">{placeholderDescription}</p>
          {/if}
        </div>
      {/if}
    </button>
  {:else if variant === 'button'}
    <button
      type="button"
      class="uds-file-upload__zone uds-file-upload__zone--button"
      {disabled}
      onclick={openFileDialog}
    >
      {#if children}
        {@render children()}
      {:else}
        {placeholderText}
      {/if}
    </button>
  {:else if variant === 'avatar-upload'}
    <button
      type="button"
      class="uds-file-upload__zone uds-file-upload__zone--avatar"
      aria-disabled={disabled || undefined}
      onclick={openFileDialog}
    >
      {#if children}
        {@render children()}
      {:else}
        <span class="uds-file-upload__avatar-placeholder" aria-hidden="true">+</span>
      {/if}
    </button>
  {/if}

  {#if displayError}
    <p class="uds-file-upload__error" role="alert">{displayError}</p>
  {/if}
</div>
