<script lang="ts">
  interface Props {
    items: unknown[];
    autoPlay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    ariaLabel?: string;
    onSlideChange?: (index: number) => void;
    children?: import('svelte').Snippet<[{ item: unknown; index: number }]>;
    class?: string;
    [key: string]: unknown;
  }

  let {
    items,
    autoPlay = false,
    interval = 5000,
    showDots = true,
    showArrows = true,
    ariaLabel = 'Content carousel',
    onSlideChange,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  let current = $state(0);
  let isPaused = $state(false);

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, items.length - 1));
    current = next;
    onSlideChange?.(next);
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  let intervalId: ReturnType<typeof setInterval> | null = null;
  $effect(() => {
    if (intervalId) clearInterval(intervalId);
    if (autoPlay && !isPaused && items.length > 1) {
      intervalId = setInterval(() => {
        current = (current + 1) % items.length;
        onSlideChange?.(current);
      }, interval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  let classes = $derived(['uds-carousel', className].filter(Boolean).join(' '));
</script>

{#if items.length}
  <section
    class={classes}
    role="region"
    aria-roledescription="carousel"
    aria-label={ariaLabel}
    onfocus={() => (isPaused = true)}
    onblur={() => (isPaused = false)}
    onmouseenter={() => (isPaused = true)}
    onmouseleave={() => (isPaused = false)}
    {...rest}
  >
    <div class="uds-carousel__track" style="transform: translateX(-{current * 100}%)">
      {#each items as item, i}
        <div
          class="uds-carousel__slide"
          role="group"
          aria-roledescription="slide"
          aria-label="Slide {i + 1} of {items.length}"
        >
          {@render children?.({ item, index: i })}
        </div>
      {/each}
    </div>
    {#if showArrows && items.length > 1}
      <button
        type="button"
        class="uds-carousel__arrow uds-carousel__arrow--prev"
        aria-label="Previous slide"
        disabled={current === 0}
        onclick={() => prev()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        type="button"
        class="uds-carousel__arrow uds-carousel__arrow--next"
        aria-label="Next slide"
        disabled={current === items.length - 1}
        onclick={() => next()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    {/if}
    {#if showDots && items.length > 1}
      <div class="uds-carousel__dots" role="tablist" aria-label="Slide indicators">
        {#each items as _, i}
          <button
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label="Slide {i + 1}"
            class="uds-carousel__dot {i === current ? 'uds-carousel__dot--active' : ''}"
            onclick={() => goTo(i)}
          />
        {/each}
      </div>
    {/if}
  </section>
{/if}
