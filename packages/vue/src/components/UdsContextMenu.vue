<script setup lang="ts">
import { computed, ref, watch, onUnmounted, Teleport } from 'vue';

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface ContextMenuProps {
  /** Menu items displayed on right-click. */
  items: ContextMenuItem[];
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<ContextMenuProps>(), {
  className: undefined,
});

const emit = defineEmits<{
  select: [id: string];
}>();

const open = ref(false);
const pos = ref({ x: 0, y: 0 });
const triggerRef = ref<HTMLDivElement | null>(null);

function handleContextMenu(e: MouseEvent) {
  e.preventDefault();
  pos.value = { x: e.clientX, y: e.clientY };
  open.value = true;
}

function close() {
  open.value = false;
}

function handleItemClick(id: string) {
  emit('select', id);
  open.value = false;
}

function handleMenuClick(e: MouseEvent) {
  e.stopPropagation();
}

function handleMenuKeyDown(e: KeyboardEvent) {
  e.stopPropagation();
}

watch(open, (val) => {
  if (val) {
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
  } else {
    document.removeEventListener('click', close);
    document.removeEventListener('scroll', close, true);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', close);
  document.removeEventListener('scroll', close, true);
});

const classes = computed(() =>
  ['uds-context-menu', props.className].filter(Boolean).join(' '),
);

const menuStyle = computed(() => ({
  left: `${pos.value.x}px`,
  top: `${pos.value.y}px`,
}));
</script>

<template>
  <div
    ref="triggerRef"
    :class="classes"
    role="region"
    aria-label="Context menu trigger"
    @contextmenu="handleContextMenu"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="open"
        class="uds-context-menu__menu"
        role="menu"
        :style="menuStyle"
        @click="handleMenuClick"
        @keydown="handleMenuKeyDown"
      >
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          role="menuitem"
          class="uds-context-menu__item"
          :disabled="item.disabled"
          @click="handleItemClick(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
