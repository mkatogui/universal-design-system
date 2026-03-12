<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface Props {
  variant?: 'simple' | 'rich'
  size?: 'sm' | 'md'
  content?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'simple',
  size: 'sm',
  position: 'top',
})

const visible = ref(false)
const tooltipId = useId()

const classes = computed(() =>
  [
    'uds-tooltip',
    `uds-tooltip--${props.variant}`,
    `uds-tooltip--${props.size}`,
    `uds-tooltip--${props.position}`,
    visible.value && 'uds-tooltip--visible',
  ]
    .filter(Boolean)
    .join(' ')
)

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}
</script>

<template>
  <div :class="classes">
    <div
      class="uds-tooltip__trigger"
      :aria-describedby="tooltipId"
      @mouseenter="show"
      @mouseleave="hide"
      @focusin="show"
      @focusout="hide"
    >
      <slot />
    </div>
    <div
      v-if="visible"
      :id="tooltipId"
      role="tooltip"
      class="uds-tooltip__content"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </div>
</template>
