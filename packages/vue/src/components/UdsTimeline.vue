<template>
  <ul :class="classes">
    <li
      v-for="(item, i) in items"
      :key="typeof item.title === 'string' ? item.title : `timeline-${i}`"
      class="uds-timeline__item"
    >
      <div class="uds-timeline__dot" aria-hidden="true" />
      <div class="uds-timeline__content">
        <div class="uds-timeline__title">
          <component v-if="typeof item.title !== 'string'" :is="() => item.title" />
          <template v-else>{{ item.title }}</template>
        </div>
        <time v-if="item.time" class="uds-timeline__time">{{ item.time }}</time>
        <div v-if="item.content" class="uds-timeline__body">
          <component v-if="typeof item.content !== 'string'" :is="() => item.content" />
          <template v-else>{{ item.content }}</template>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, type VNode } from 'vue';

export interface TimelineItem {
  title: string | VNode;
  content?: string | VNode;
  time?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

const props = defineProps<TimelineProps>();

const classes = computed(() => 'uds-timeline');
</script>
