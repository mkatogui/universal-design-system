<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'dropzone' | 'button' | 'avatar-upload'
  size?: 'sm' | 'md' | 'lg'
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  /** Accessible label for the upload zone. @default 'Upload files' */
  label?: string
  /** Error message shown below the zone (e.g. validation from parent). Overrides internal validation error. */
  error?: string
  /** Main placeholder text. @default 'Drag and drop files here, or click to browse' (dropzone) or 'Choose file' (button) */
  placeholderTitle?: string
  /** Optional second line in placeholder (e.g. accepted types or size limit). */
  placeholderDescription?: string
  /** Label for the browse action. @default 'browse' */
  acceptLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dropzone',
  size: 'md',
  maxFiles: 1,
  label: 'Upload files',
  acceptLabel: 'browse',
})

const emit = defineEmits<{
  upload: [files: File[]]
  remove: [file: File]
}>()

const dragOver = ref(false)
const internalError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const displayError = computed(() => props.error ?? internalError.value)

const classes = computed(() =>
  [
    'uds-file-upload',
    `uds-file-upload--${props.variant}`,
    `uds-file-upload--${props.size}`,
    dragOver.value && 'uds-file-upload--drag-over',
    props.disabled && 'uds-file-upload--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

const placeholderText = computed(() =>
  props.placeholderTitle ??
    (props.variant === 'button'
      ? 'Choose file'
      : `Drag and drop files here, or click to ${props.acceptLabel}`)
)

function validateFiles(files: File[]): File[] {
  internalError.value = null
  let valid = files
  if (props.maxSize) {
    const oversized = valid.filter((f) => f.size > props.maxSize!)
    if (oversized.length > 0) {
      internalError.value = `File too large: ${oversized[0].name}`
      valid = valid.filter((f) => f.size <= props.maxSize!)
    }
  }
  if (props.maxFiles) {
    valid = valid.slice(0, props.maxFiles)
  }
  return valid
}

function handleFiles(fileList: FileList | null) {
  if (!fileList) return
  const files = Array.from(fileList)
  const valid = validateFiles(files)
  if (valid.length) {
    emit('upload', valid)
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (props.disabled) return
  handleFiles(e.dataTransfer?.files || null)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}
</script>

<template>
  <div :class="classes">
    <input
      ref="fileInputRef"
      type="file"
      class="uds-file-upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :aria-label="label"
      hidden
      @change="handleInputChange"
    />

    <button
      v-if="variant === 'dropzone'"
      type="button"
      class="uds-file-upload__zone"
      :aria-disabled="disabled || undefined"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
    >
      <slot>
        <div class="uds-file-upload__placeholder">
          <p class="uds-file-upload__text">{{ placeholderText }}</p>
          <p v-if="placeholderDescription" class="uds-file-upload__sub">{{ placeholderDescription }}</p>
        </div>
      </slot>
    </button>

    <button
      v-else-if="variant === 'button'"
      type="button"
      class="uds-file-upload__zone uds-file-upload__zone--button"
      :disabled="disabled"
      @click="openFileDialog"
    >
      <slot>{{ placeholderText }}</slot>
    </button>

    <button
      v-else-if="variant === 'avatar-upload'"
      type="button"
      class="uds-file-upload__zone uds-file-upload__zone--avatar"
      :aria-disabled="disabled || undefined"
      @click="openFileDialog"
    >
      <slot>
        <span class="uds-file-upload__avatar-placeholder" aria-hidden="true">+</span>
      </slot>
    </button>

    <p v-if="displayError" class="uds-file-upload__error" role="alert">
      {{ displayError }}
    </p>
  </div>
</template>
