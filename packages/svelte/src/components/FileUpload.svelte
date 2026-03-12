<script lang="ts">
  interface Props {
    variant?: 'dropzone' | 'button' | 'avatar-upload';
    size?: 'sm' | 'md' | 'lg';
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    state?: 'idle' | 'drag-over' | 'uploading' | 'success' | 'error';
    label?: string;
    onUpload?: (files: FileList) => void;
    onRemove?: (index: number) => void;
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
    state = 'idle',
    label = 'Upload file',
    onUpload,
    onRemove,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let dragOver = $state(false);
  let inputId = $derived(`uds-file-upload-${Math.random().toString(36).slice(2, 9)}`);

  let currentState = $derived(dragOver ? 'drag-over' : state);

  let classes = $derived(
    [
      'uds-file-upload',
      `uds-file-upload--${variant}`,
      `uds-file-upload--${size}`,
      `uds-file-upload--${currentState}`,
      disabled && 'uds-file-upload--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      onUpload?.(target.files);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      onUpload?.(event.dataTransfer.files);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }
</script>

<div class={classes} {...rest}>
  {#if variant === 'dropzone'}
    <div
      class="uds-file-upload__dropzone"
      role="button"
      tabindex="0"
      aria-label={label}
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => document.getElementById(inputId)?.click()}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById(inputId)?.click(); } }}
    >
      <p class="uds-file-upload__text">{label}</p>
      <p class="uds-file-upload__hint">Drag and drop or click to browse</p>
      {@render children?.()}
    </div>
  {:else}
    <button
      class="uds-file-upload__button"
      type="button"
      {disabled}
      onclick={() => document.getElementById(inputId)?.click()}
    >
      {label}
    </button>
  {/if}
  <input
    class="uds-file-upload__input"
    type="file"
    id={inputId}
    {accept}
    {multiple}
    {disabled}
    aria-label={label}
    onchange={handleFileChange}
    style="display:none"
  />
  {#if currentState === 'uploading'}
    <div class="uds-file-upload__progress" aria-live="polite">Uploading...</div>
  {/if}
</div>
