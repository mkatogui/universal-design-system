<template>
  <nav :class="classes" aria-label="Menu">
    <div v-for="item in items" :key="item.id" role="none">
      <a
        v-if="item.href"
        :href="item.href"
        role="menuitem"
        :class="itemClasses(item)"
        :aria-current="activeItemId === item.id ? 'page' : undefined"
        :aria-disabled="item.disabled"
      >
        {{ item.label }}
      </a>
      <span
        v-else
        role="menuitem"
        :tabindex="0"
        :class="itemClasses(item)"
        :aria-disabled="item.disabled"
      >
        {{ item.label }}
      </span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  orientation?: 'horizontal' | 'vertical';
  activeItemId?: string;
}

const props = withDefaults(defineProps<MenuProps>(), {
  orientation: 'horizontal',
});

const classes = computed(() =>
  ['uds-menu', `uds-menu--${props.orientation}`].join(' '),
);

function itemClasses(item: MenuItem): string {
  return [
    'uds-menu__item',
    props.activeItemId === item.id && 'uds-menu__item--active',
  ]
    .filter(Boolean)
    .join(' ');
}
</script>
