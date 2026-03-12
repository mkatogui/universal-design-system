<script lang="ts">
  interface Tab {
    label: string;
    language: string;
    code: string;
  }

  interface Props {
    variant?: 'syntax-highlighted' | 'terminal' | 'multi-tab';
    size?: 'sm' | 'md' | 'lg';
    language?: string;
    code?: string;
    showLineNumbers?: boolean;
    showCopy?: boolean;
    tabs?: Tab[];
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'syntax-highlighted',
    size = 'md',
    language = '',
    code = '',
    showLineNumbers = false,
    showCopy = true,
    tabs = [],
    class: className = '',
    ...rest
  }: Props = $props();

  let copied = $state(false);
  let activeTab = $state(0);

  let classes = $derived(
    [
      'uds-code-block',
      `uds-code-block--${variant}`,
      `uds-code-block--${size}`,
      showLineNumbers && 'uds-code-block--line-numbers',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let displayCode = $derived(
    variant === 'multi-tab' && tabs.length > 0 ? tabs[activeTab].code : code
  );

  let displayLanguage = $derived(
    variant === 'multi-tab' && tabs.length > 0 ? tabs[activeTab].language : language
  );

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(displayCode);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Clipboard API not available
    }
  }
</script>

<div class={classes} {...rest}>
  {#if variant === 'multi-tab' && tabs.length > 0}
    <div class="uds-code-block__tabs" role="tablist">
      {#each tabs as tab, i}
        <button
          class="uds-code-block__tab"
          class:uds-code-block__tab--active={i === activeTab}
          role="tab"
          aria-selected={i === activeTab}
          onclick={() => (activeTab = i)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  {/if}
  <div class="uds-code-block__container">
    {#if showCopy}
      <button class="uds-code-block__copy" onclick={copyToClipboard} aria-label="Copy code">
        {copied ? 'Copied' : 'Copy'}
      </button>
    {/if}
    <pre class="uds-code-block__pre"><code class="uds-code-block__code language-{displayLanguage}">{displayCode}</code></pre>
  </div>
</div>
