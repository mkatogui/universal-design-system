<script lang="ts">
  interface TimelineItem {
    title: string;
    content?: string;
    time?: string;
  }

  interface Props {
    items: TimelineItem[];
    class?: string;
    [key: string]: any;
  }

  let {
    items,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    ['uds-timeline', className].filter(Boolean).join(' ')
  );
</script>

<ul class={classes} {...rest}>
  {#each items as item, i (item.title ?? `timeline-${i}`)}
    <li class="uds-timeline__item">
      <div class="uds-timeline__dot" aria-hidden="true"></div>
      <div class="uds-timeline__content">
        <div class="uds-timeline__title">{item.title}</div>
        {#if item.time}
          <time class="uds-timeline__time">{item.time}</time>
        {/if}
        {#if item.content}
          <div class="uds-timeline__body">{item.content}</div>
        {/if}
      </div>
    </li>
  {/each}
</ul>
