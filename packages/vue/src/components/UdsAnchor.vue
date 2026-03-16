<script setup lang="ts">
import { computed } from 'vue';

export interface AnchorItem {
  href: string;
  title: string;
}

export interface AnchorProps {
  /** Navigation items linking to in-page anchors. */
  items: AnchorItem[];
  /** Enable smooth scroll behavior. @default true */
  smoothScroll?: boolean;
  /** Additional CSS class. */
  className?: string;
}

const props = withDefaults(defineProps<AnchorProps>(), {
  smoothScroll: true,
  className: undefined,
});

const classes = computed(() =>
  ['uds-anchor', props.className].filter(Boolean).join(' '),
);

const linkStyle = computed(() =>
  props.smoothScroll ? { scrollBehavior: 'smooth' as const } : undefined,
);
</script>

<template>
  <nav :class="classes" aria-label="On this page">
    <ul style="list-style: none; padding: 0; margin: 0">
      <li v-for="item in items" :key="item.href">
        <a
          :href="item.href"
          :style="linkStyle"
          class="uds-anchor__link"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
