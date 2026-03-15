<script setup lang="ts">
interface Props {
  id?: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <form class="uds-form" :class="props.class" :id="props.id">
    <slot />
  </form>
</template>
