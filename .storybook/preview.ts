import type { Preview } from '@storybook/html';

const PALETTES = [
  'minimal-saas',
  'ai-futuristic',
  'gradient-startup',
  'corporate',
  'apple-minimal',
  'illustration',
  'dashboard',
  'bold-lifestyle',
  'minimal-corporate',
];

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  globalTypes: {
    palette: {
      name: 'Palette',
      description: 'UDS palette theme',
      defaultValue: 'minimal-saas',
      toolbar: {
        icon: 'paintbrush',
        items: PALETTES.map((p) => ({ value: p, title: p })),
        dynamicTitle: true,
      },
    },
    darkMode: {
      name: 'Dark Mode',
      description: 'Toggle dark mode',
      defaultValue: false,
      toolbar: {
        icon: 'moon',
        items: [
          { value: false, title: 'Light' },
          { value: true, title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const palette = context.globals.palette || 'minimal-saas';
      const darkMode = context.globals.darkMode;
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-theme', palette);
      if (darkMode) wrapper.classList.add('docs-dark');
      wrapper.style.padding = '2rem';
      wrapper.style.minHeight = '100px';
      const content = story();
      if (typeof content === 'string') {
        wrapper.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        wrapper.appendChild(content);
      }
      return wrapper;
    },
  ],
};

export default preview;
