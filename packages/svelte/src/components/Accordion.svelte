<script lang="ts">
  interface AccordionItem {
    id: string;
    title: string;
    content: string;
  }

  interface Props {
    variant?: 'single' | 'multi' | 'flush';
    items?: AccordionItem[];
    defaultExpanded?: string[];
    allowMultiple?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'single',
    items = [],
    defaultExpanded = [],
    allowMultiple = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let expandedItems = $state<Set<string>>(new Set(defaultExpanded));

  let classes = $derived(
    [
      'uds-accordion',
      `uds-accordion--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function toggle(id: string) {
    if (expandedItems.has(id)) {
      expandedItems.delete(id);
      expandedItems = new Set(expandedItems);
    } else {
      if (allowMultiple || variant === 'multi') {
        expandedItems.add(id);
        expandedItems = new Set(expandedItems);
      } else {
        expandedItems = new Set([id]);
      }
    }
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = (index - 1 + items.length) % items.length;
    }
    if (nextIndex !== undefined) {
      event.preventDefault();
      const buttons = (event.currentTarget as HTMLElement)
        .closest('.uds-accordion')?.querySelectorAll('.uds-accordion__trigger') as NodeListOf<HTMLElement>;
      buttons?.[nextIndex]?.focus();
    }
  }
</script>

<div class={classes} {...rest}>
  {#each items as item, i}
    {@const isExpanded = expandedItems.has(item.id)}
    <div class="uds-accordion__item" class:uds-accordion__item--expanded={isExpanded}>
      <h3 class="uds-accordion__header">
        <button
          class="uds-accordion__trigger"
          aria-expanded={isExpanded}
          aria-controls="accordion-panel-{item.id}"
          id="accordion-header-{item.id}"
          onclick={() => toggle(item.id)}
          onkeydown={(e) => handleKeydown(e, i)}
        >
          {item.title}
          <span class="uds-accordion__icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div
        class="uds-accordion__panel"
        id="accordion-panel-{item.id}"
        role="region"
        aria-labelledby="accordion-header-{item.id}"
        hidden={!isExpanded}
      >
        <div class="uds-accordion__content">{item.content}</div>
      </div>
    </div>
  {/each}
  {@render children?.()}
</div>
