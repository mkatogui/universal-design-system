<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  value?: string[]
  defaultValue?: string[]
  maxChips?: number
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: () => [],
  placeholder: 'Add...',
  disabled: false,
})

const emit = defineEmits<{
  change: [chips: string[]]
  add: [chip: string]
  remove: [index: number]
}>()

const internalValue = ref<string[]>([...(props.defaultValue ?? [])])
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const chips = computed(() => props.value ?? internalValue.value)

watch(() => props.value, (v) => { if (v !== undefined) internalValue.value = [...v] })

const classes = computed(() =>
  ['uds-chip-input', props.disabled && 'uds-chip-input--disabled'].filter(Boolean).join(' ')
)

function updateChips(next: string[]) {
  if (props.value === undefined) internalValue.value = next
  emit('change', next)
}

function handleAdd() {
  const trimmed = inputValue.value.trim()
  if (!trimmed || (props.maxChips != null && chips.value.length >= props.maxChips)) return
  if (chips.value.includes(trimmed)) return
  updateChips([...chips.value, trimmed])
  emit('add', trimmed)
  inputValue.value = ''
}

function handleRemove(index: number) {
  updateChips(chips.value.filter((_, i) => i !== index))
  emit('remove', index)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleAdd()
  }
  if (e.key === 'Backspace' && inputValue.value === '' && chips.value.length > 0) {
    handleRemove(chips.value.length - 1)
  }
}
</script>

<template>
  <div
    :class="classes"
    role="listbox"
    aria-label="Chips"
    :aria-disabled="disabled"
    @click="inputRef?.focus()"
  >
    <span
      v-for="(chip, index) in chips"
      :key="`${chip}-${index}`"
      class="uds-chip-input__chip"
      role="option"
    >
      <span class="uds-chip-input__chip-label">{{ chip }}</span>
      <button
        type="button"
        class="uds-chip-input__chip-remove"
        :aria-label="`Remove ${chip}`"
        :disabled="disabled"
        @click.stop="handleRemove(index)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
    <input
      v-if="maxChips == null || chips.length < maxChips"
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="uds-chip-input__input"
      :placeholder="placeholder"
      aria-label="Add chip"
      :disabled="disabled"
      @keydown="handleKeydown"
    >
  </div>
</template>
