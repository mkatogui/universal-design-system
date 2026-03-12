<script lang="ts">
  interface Props {
    variant?: 'simple' | 'rich';
    size?: 'sm' | 'md';
    content?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
    trigger?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'simple',
    size = 'sm',
    content = '',
    position = 'top',
    class: className = '',
    trigger,
    children,
    ...rest
  }: Props = $props();

  let visible = $state(false);
  let tooltipId = $derived(`uds-tooltip-${Math.random().toString(36).slice(2, 9)}`);

  let classes = $derived(
    [
      'uds-tooltip',
      `uds-tooltip--${variant}`,
      `uds-tooltip--${size}`,
      `uds-tooltip--${position}`,
      visible && 'uds-tooltip--visible',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function show() { visible = true; }
  function hide() { visible = false; }
</script>

<div class={classes} {...rest}>
  <div
    class="uds-tooltip__trigger"
    aria-describedby={tooltipId}
    onmouseenter={show}
    onmouseleave={hide}
    onfocus={show}
    onblur={hide}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      {@render children?.()}
    {/if}
  </div>
  <div
    class="uds-tooltip__content"
    id={tooltipId}
    role="tooltip"
    aria-hidden={!visible}
  >
    {content}
  </div>
</div>
