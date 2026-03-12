<script lang="ts">
  interface TabItem {
    id: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    variant?: 'line' | 'pill' | 'segmented';
    size?: 'sm' | 'md' | 'lg';
    tabs?: TabItem[];
    activeTab?: string;
    onChange?: (tabId: string) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'line',
    size = 'md',
    tabs = [],
    activeTab = $bindable(''),
    onChange,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-tabs',
      `uds-tabs--${variant}`,
      `uds-tabs--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleTabClick(tabId: string) {
    activeTab = tabId;
    onChange?.(tabId);
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);

    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % enabledTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      handleTabClick(enabledTabs[nextIndex].id);
      const btn = (event.currentTarget as HTMLElement)
        .parentElement?.querySelectorAll('[role="tab"]:not([disabled])')[nextIndex] as HTMLElement;
      btn?.focus();
    }
  }
</script>

<div class={classes} {...rest}>
  <div class="uds-tabs__list" role="tablist">
    {#each tabs as tab, i}
      <button
        class="uds-tabs__tab"
        class:uds-tabs__tab--active={activeTab === tab.id}
        role="tab"
        id="tab-{tab.id}"
        aria-selected={activeTab === tab.id}
        aria-controls="tabpanel-{tab.id}"
        disabled={tab.disabled}
        tabindex={activeTab === tab.id ? 0 : -1}
        onclick={() => handleTabClick(tab.id)}
        onkeydown={(e) => handleKeydown(e, i)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  {#each tabs as tab}
    <div
      class="uds-tabs__panel"
      class:uds-tabs__panel--active={activeTab === tab.id}
      role="tabpanel"
      id="tabpanel-{tab.id}"
      aria-labelledby="tab-{tab.id}"
      hidden={activeTab !== tab.id}
    >
      {#if activeTab === tab.id}
        {@render children?.()}
      {/if}
    </div>
  {/each}
</div>
