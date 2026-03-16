<template>
  <div v-if="errored && $slots.fallback" :class="classes">
    <slot name="fallback" />
  </div>
  <img
    v-else
    :src="src"
    :alt="alt"
    :class="classes"
    loading="lazy"
    v-bind="$attrs"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface ImageProps {
  src?: string;
  alt: string;
}

const props = defineProps<ImageProps>();

const emit = defineEmits<{
  error: [event: Event];
}>();

const errored = ref(false);

const classes = computed(() => 'uds-image');

function handleError(e: Event) {
  errored.value = true;
  emit('error', e);
}
</script>
