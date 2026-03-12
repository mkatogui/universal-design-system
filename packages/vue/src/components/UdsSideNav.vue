<script setup lang="ts">
import { computed } from 'vue'

interface NavItem {
  label: string
  href?: string
  icon?: string
  active?: boolean
  children?: NavItem[]
}

interface Section {
  title: string
  items: NavItem[]
}

interface Props {
  variant?: 'default' | 'collapsed' | 'with-sections'
  collapsed?: boolean
  items?: NavItem[]
  sections?: Section[]
  activeItem?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  items: () => [],
  sections: () => [],
})

const emit = defineEmits<{
  navigate: [href: string]
}>()

const classes = computed(() =>
  [
    'uds-side-nav',
    `uds-side-nav--${props.variant}`,
    props.collapsed && 'uds-side-nav--collapsed',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleNavigate(href: string) {
  emit('navigate', href)
}
</script>

<template>
  <nav :class="classes" aria-label="Side navigation">
    <template v-if="variant === 'with-sections' && sections.length">
      <div v-for="(section, si) in sections" :key="si" class="uds-side-nav__section">
        <h3 class="uds-side-nav__section-title">{{ section.title }}</h3>
        <ul class="uds-side-nav__list">
          <li v-for="(item, i) in section.items" :key="i" class="uds-side-nav__item">
            <a
              :href="item.href || '#'"
              class="uds-side-nav__link"
              :class="{ 'uds-side-nav__link--active': item.active || item.href === activeItem }"
              :aria-current="item.active || item.href === activeItem ? 'page' : undefined"
              @click.prevent="handleNavigate(item.href || '')"
            >
              <span v-if="item.icon" class="uds-side-nav__icon" aria-hidden="true">{{ item.icon }}</span>
              <span v-if="!collapsed" class="uds-side-nav__label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </template>
    <template v-else>
      <ul class="uds-side-nav__list">
        <li v-for="(item, i) in items" :key="i" class="uds-side-nav__item">
          <a
            :href="item.href || '#'"
            class="uds-side-nav__link"
            :class="{ 'uds-side-nav__link--active': item.active || item.href === activeItem }"
            :aria-current="item.active || item.href === activeItem ? 'page' : undefined"
            :aria-expanded="item.children?.length ? undefined : undefined"
            @click.prevent="handleNavigate(item.href || '')"
          >
            <span v-if="item.icon" class="uds-side-nav__icon" aria-hidden="true">{{ item.icon }}</span>
            <span v-if="!collapsed" class="uds-side-nav__label">{{ item.label }}</span>
          </a>
          <ul v-if="item.children?.length && !collapsed" class="uds-side-nav__sublist">
            <li v-for="(child, ci) in item.children" :key="ci" class="uds-side-nav__subitem">
              <a
                :href="child.href || '#'"
                class="uds-side-nav__sublink"
                :class="{ 'uds-side-nav__sublink--active': child.active || child.href === activeItem }"
                :aria-current="child.active || child.href === activeItem ? 'page' : undefined"
                @click.prevent="handleNavigate(child.href || '')"
              >
                {{ child.label }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </nav>
</template>
