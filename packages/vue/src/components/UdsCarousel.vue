<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  items: unknown[]
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false,
  interval: 5000,
  showDots: true,
  showArrows: true,
  ariaLabel: 'Content carousel',
})

const emit = defineEmits<{
  slideChange: [index: number]
}>()

const current = ref(0)
const isPaused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  const next = Math.max(0, Math.min(index, props.items.length - 1))
  current.value = next
  emit('slideChange', next)
}

function next() {
  goTo(current.value + 1)
}
function prev() {
  goTo(current.value - 1)
}

watch([() => props.autoPlay, isPaused], ([autoPlay, paused]) => {
  if (timer) clearInterval(timer)
  if (autoPlay && !paused && props.items.length > 1) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % props.items.length
      emit('slideChange', current.value)
    }, props.interval)
  }
  return () => { if (timer) clearInterval(timer) }
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <section
    v-if="items.length"
    class="uds-carousel"
    role="region"
    aria-roledescription="carousel"
    :aria-label="ariaLabel"
    @focus="isPaused = true"
    @blur="isPaused = false"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <div class="uds-carousel__track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="uds-carousel__slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="`Slide ${i + 1} of ${items.length}`"
      >
        <slot name="item" :item="item" :index="i" />
      </div>
    </div>
    <template v-if="showArrows && items.length > 1">
      <button
        type="button"
        class="uds-carousel__arrow uds-carousel__arrow--prev"
        aria-label="Previous slide"
        :disabled="current === 0"
        @click="prev"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        type="button"
        class="uds-carousel__arrow uds-carousel__arrow--next"
        aria-label="Next slide"
        :disabled="current === items.length - 1"
        @click="next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </template>
    <div v-if="showDots && items.length > 1" class="uds-carousel__dots" role="tablist" aria-label="Slide indicators">
      <button
        v-for="(_, i) in items"
        :key="i"
        type="button"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`Slide ${i + 1}`"
        :class="['uds-carousel__dot', i === current && 'uds-carousel__dot--active'].filter(Boolean).join(' ')"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>
