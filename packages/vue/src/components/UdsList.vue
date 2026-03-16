<template>
  <component :is="tag" ref="listRef" :class="classes" v-bind="$attrs">
    <template v-if="items && items.length">
      <li v-for="(item, i) in items" :key="i" class="uds-list__item">
        <component :is="() => item" />
      </li>
    </template>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, type VNode } from 'vue';

export interface ListProps {
  variant?: 'bullet' | 'numbered' | 'none';
  dense?: boolean;
  items?: VNode[];
}

const props = withDefaults(defineProps<ListProps>(), {
  variant: 'bullet',
  dense: false,
});

const listRef = ref<HTMLUListElement | HTMLOListElement | null>(null);

const tag = computed(() => (props.variant === 'numbered' ? 'ol' : 'ul'));

const classes = computed(() =>
  [
    'uds-list',
    `uds-list--${props.variant}`,
    props.dense && 'uds-list--dense',
  ]
    .filter(Boolean)
    .join(' '),
);

defineExpose({ el: listRef });
</script>
