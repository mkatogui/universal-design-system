<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, useId } from 'vue';

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9\-_]/g, '_');
}

export interface ComboboxOption {
  /** Unique identifier for this option. */
  value: string;
  /** User-visible label. */
  label: string;
  /** Prevent selection of this option. */
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Visible label text. */
  label: string;
  /** Available options. */
  options: ComboboxOption[];
  /** Currently selected value(s). */
  modelValue?: string | string[];
  /** Placeholder text for the input. @default 'Search...' */
  placeholder?: string;
  /** Combobox variant. @default 'autocomplete' */
  variant?: 'autocomplete' | 'multiselect' | 'creatable';
  /** Error message to display. */
  errorText?: string;
  /** Whether the combobox is disabled. */
  disabled?: boolean;
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  modelValue: undefined,
  placeholder: 'Search...',
  variant: 'autocomplete',
  errorText: undefined,
  disabled: false,
  size: 'md',
  className: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  select: [value: string | string[]];
}>();

const query = ref('');
const isOpen = ref(false);
const activeIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLDivElement | null>(null);

const reactId = useId();
const listboxId = computed(() => `${reactId}-listbox`);
const labelId = computed(() => `${reactId}-label`);
const errorId = computed(() => `${reactId}-error`);
const inputId = computed(() => `${reactId}-input`);

const filtered = computed(() =>
  props.options.filter((o) =>
    o.label.toLowerCase().includes(query.value.toLowerCase()),
  ),
);

const selectedValues = computed<string[]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue;
  if (props.modelValue) return [props.modelValue];
  return [];
});

function handleSelect(optionValue: string) {
  if (props.variant === 'multiselect') {
    const next = selectedValues.value.includes(optionValue)
      ? selectedValues.value.filter((v) => v !== optionValue)
      : [...selectedValues.value, optionValue];
    emit('update:modelValue', next);
    emit('select', next);
  } else {
    emit('update:modelValue', optionValue);
    emit('select', optionValue);
    isOpen.value = false;
    query.value = props.options.find((o) => o.value === optionValue)?.label ?? '';
  }
}

function handleCreate() {
  if (props.variant === 'creatable' && query.value.trim()) {
    emit('update:modelValue', query.value.trim());
    emit('select', query.value.trim());
    isOpen.value = false;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (isOpen.value) {
      activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
    } else {
      isOpen.value = true;
      activeIndex.value = 0;
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex.value >= 0 && filtered.value[activeIndex.value] && !filtered.value[activeIndex.value].disabled) {
      handleSelect(filtered.value[activeIndex.value].value);
    } else if (props.variant === 'creatable' && filtered.value.length === 0) {
      handleCreate();
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false;
    activeIndex.value = -1;
  }
}

function handleInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  activeIndex.value = -1;
  isOpen.value = true;
}

function handleFocus() {
  isOpen.value = true;
}

function handleClickOutside(e: MouseEvent) {
  if (
    inputRef.value &&
    !inputRef.value.contains(e.target as Node) &&
    listboxRef.value &&
    !listboxRef.value.contains(e.target as Node)
  ) {
    isOpen.value = false;
    activeIndex.value = -1;
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const classes = computed(() =>
  [
    'uds-combobox',
    `uds-combobox--${props.variant}`,
    `uds-combobox--${props.size}`,
    props.errorText && 'uds-combobox--error',
    props.disabled && 'uds-combobox--disabled',
    props.className,
  ]
    .filter(Boolean)
    .join(' '),
);

const activeDescendant = computed(() => {
  if (activeIndex.value >= 0 && filtered.value[activeIndex.value]) {
    return `${listboxId.value}-opt-${sanitizeId(filtered.value[activeIndex.value].value)}`;
  }
  return undefined;
});

function optionClasses(option: ComboboxOption, index: number): string {
  return [
    'uds-combobox__option',
    index === activeIndex.value && 'uds-combobox__option--active',
    option.disabled && 'uds-combobox__option--disabled',
    selectedValues.value.includes(option.value) && 'uds-combobox__option--selected',
  ]
    .filter(Boolean)
    .join(' ');
}

function handleOptionKeyDown(e: KeyboardEvent, option: ComboboxOption) {
  if ((e.key === 'Enter' || e.key === ' ') && !option.disabled) {
    e.preventDefault();
    handleSelect(option.value);
  }
}

function handleCreateKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleCreate();
  }
}
</script>

<template>
  <div :class="classes">
    <label :id="labelId" :for="inputId" class="uds-combobox__label">
      {{ label }}
    </label>
    <div class="uds-combobox__input-wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        class="uds-combobox__input"
        type="text"
        :value="query"
        :placeholder="placeholder"
        role="combobox"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-controls="listboxId"
        :aria-labelledby="labelId"
        :aria-activedescendant="activeDescendant"
        :aria-invalid="errorText ? true : undefined"
        :aria-describedby="errorText ? errorId : undefined"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @keydown="handleKeyDown"
      />
    </div>
    <div
      v-if="isOpen"
      :id="listboxId"
      ref="listboxRef"
      class="uds-combobox__listbox"
      role="listbox"
      :aria-labelledby="labelId"
      :aria-multiselectable="variant === 'multiselect' ? true : undefined"
    >
      <div
        v-for="(option, index) in filtered"
        :key="option.value"
        :id="`${listboxId}-opt-${sanitizeId(option.value)}`"
        :class="optionClasses(option, index)"
        role="option"
        :tabindex="-1"
        :aria-selected="selectedValues.includes(option.value)"
        :aria-disabled="option.disabled"
        @click="!option.disabled && handleSelect(option.value)"
        @keydown="handleOptionKeyDown($event, option)"
      >
        {{ option.label }}
      </div>
      <div
        v-if="filtered.length === 0 && variant === 'creatable' && query.trim()"
        class="uds-combobox__option uds-combobox__option--create"
        role="option"
        :tabindex="-1"
        :aria-selected="false"
        @click="handleCreate"
        @keydown="handleCreateKeyDown"
      >
        Create &ldquo;{{ query.trim() }}&rdquo;
      </div>
      <div
        v-if="filtered.length === 0 && variant !== 'creatable'"
        class="uds-combobox__empty"
      >
        No results found
      </div>
    </div>
    <div
      v-if="errorText"
      :id="errorId"
      class="uds-combobox__error"
      role="alert"
    >
      {{ errorText }}
    </div>
  </div>
</template>
