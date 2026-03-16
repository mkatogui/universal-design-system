<template>
  <section :class="classes" aria-label="Notifications">
    <output
      v-for="item in items"
      :key="item.id"
      :class="itemClasses(item)"
      for=""
    >
      <span class="uds-notification__message">{{ item.message }}</span>
      <button
        v-if="onDismiss"
        type="button"
        class="uds-notification__dismiss"
        aria-label="Dismiss"
        @click="onDismiss(item.id)"
      >
        &times;
      </button>
    </output>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface NotificationItem {
  id: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
}

export interface NotificationProps {
  items: NotificationItem[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onDismiss?: (id: string) => void;
}

const props = withDefaults(defineProps<NotificationProps>(), {
  position: 'top-right',
});

const classes = computed(() =>
  ['uds-notification', `uds-notification--${props.position}`].join(' '),
);

function itemClasses(item: NotificationItem): string {
  return `uds-notification__item uds-notification__item--${item.variant ?? 'neutral'}`;
}
</script>
