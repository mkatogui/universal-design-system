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
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dropzone',
  size: 'md',
  maxFiles: 1,
})

const emit = defineEmits<{
  upload: [files: File[]]
  remove: [file: File]
  error: [message: string]
}>()

const dragOver = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const classes = computed(() =>
  [
    'uds-file-upload',
    `uds-file-upload--${props.variant}`,
    `uds-file-upload--${props.size}`,
    dragOver.value && 'uds-file-upload--drag-over',
    uploading.value && 'uds-file-upload--uploading',
    props.disabled && 'uds-file-upload--disabled',
  ]
    .filter(Boolean)
    .join(' ')
)

function validateFiles(files: File[]): File[] {
  return files.filter((file) => {
    if (props.maxSize && file.size > props.maxSize) {
      emit('error', `File "${file.name}" exceeds max size`)
      return false
    }
    return true
  })
}

function handleFiles(fileList: FileList | null) {
  if (!fileList) return
  let files = Array.from(fileList)
  if (props.maxFiles) {
    files = files.slice(0, props.maxFiles)
  }
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
      aria-label="Upload file"
      @change="handleInputChange"
    />

    <div
      v-if="variant === 'dropzone'"
      class="uds-file-upload__dropzone"
      role="button"
      tabindex="0"
      :aria-disabled="disabled || undefined"
      aria-live="polite"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
      @keydown.enter="openFileDialog"
      @keydown.space.prevent="openFileDialog"
    >
      <slot>
        <p class="uds-file-upload__text">Drag and drop files here, or click to browse</p>
      </slot>
    </div>

    <button
      v-else-if="variant === 'button'"
      class="uds-file-upload__button"
      :disabled="disabled"
      @click="openFileDialog"
    >
      <slot>Choose file</slot>
    </button>

    <div
      v-else-if="variant === 'avatar-upload'"
      class="uds-file-upload__avatar"
      role="button"
      tabindex="0"
      :aria-disabled="disabled || undefined"
      @click="openFileDialog"
      @keydown.enter="openFileDialog"
      @keydown.space.prevent="openFileDialog"
    >
      <slot>
        <span class="uds-file-upload__avatar-placeholder" aria-hidden="true">+</span>
      </slot>
    </div>
  </div>
</template>
