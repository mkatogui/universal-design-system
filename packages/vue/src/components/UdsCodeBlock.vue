<script setup lang="ts">
import { computed, ref } from 'vue'

interface Tab {
  label: string
  language: string
  code: string
}

interface Props {
  variant?: 'syntax-highlighted' | 'terminal' | 'multi-tab'
  size?: 'sm' | 'md' | 'lg'
  language?: string
  code?: string
  showLineNumbers?: boolean
  showCopy?: boolean
  tabs?: Tab[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'syntax-highlighted',
  size: 'md',
  showCopy: true,
  tabs: () => [],
})

const copied = ref(false)
const activeTab = ref(0)

const classes = computed(() =>
  [
    'uds-code-block',
    `uds-code-block--${props.variant}`,
    `uds-code-block--${props.size}`,
    props.showLineNumbers && 'uds-code-block--line-numbers',
    copied.value && 'uds-code-block--copied',
  ]
    .filter(Boolean)
    .join(' ')
)

const displayCode = computed(() => {
  if (props.variant === 'multi-tab' && props.tabs.length) {
    return props.tabs[activeTab.value]?.code || ''
  }
  return props.code || ''
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(displayCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Clipboard API not available
  }
}
</script>

<template>
  <div :class="classes">
    <div v-if="variant === 'multi-tab' && tabs.length" class="uds-code-block__tabs" role="tablist">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        role="tab"
        :aria-selected="activeTab === i"
        class="uds-code-block__tab"
        @click="activeTab = i"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="uds-code-block__container">
      <button
        v-if="showCopy"
        class="uds-code-block__copy"
        aria-label="Copy code to clipboard"
        @click="copyToClipboard"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
      <pre><code :class="language ? `language-${language}` : undefined">{{ displayCode }}</code></pre>
    </div>
  </div>
</template>
