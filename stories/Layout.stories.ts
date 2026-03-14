import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Components/Layout',
  tags: ['autodocs'],
};

export default meta;

export const Hero: StoryObj = {
  render: () => `
    <section class="uds-hero uds-hero--centered" style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <h1 class="uds-hero__headline">Build faster with Universal Design System</h1>
      <p class="uds-hero__subheadline">9 palettes, 43 components, ~600 tokens. WCAG 2.1 AA validated.</p>
      <div class="uds-hero__cta" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="uds-btn uds-btn--primary uds-btn--lg">Get Started</button>
        <button class="uds-btn uds-btn--secondary uds-btn--lg">View Docs</button>
      </div>
    </section>
  `,
};

export const Accordion: StoryObj = {
  render: () => `
    <div class="uds-accordion" style="max-width: 500px;">
      <div class="uds-accordion__item">
        <button class="uds-accordion__trigger" aria-expanded="true" aria-controls="acc-1">
          <span>What is the Universal Design System?</span>
        </button>
        <div id="acc-1" class="uds-accordion__content" role="region">
          <p>An AI-native design system with a BM25 reasoning engine that recommends palettes, components, and patterns based on your product domain.</p>
        </div>
      </div>
      <div class="uds-accordion__item">
        <button class="uds-accordion__trigger" aria-expanded="false" aria-controls="acc-2">
          <span>How many palettes are included?</span>
        </button>
        <div id="acc-2" class="uds-accordion__content" role="region" hidden>
          <p>9 structural palettes covering SaaS, enterprise, startup, AI, education, and more.</p>
        </div>
      </div>
      <div class="uds-accordion__item">
        <button class="uds-accordion__trigger" aria-expanded="false" aria-controls="acc-3">
          <span>Is it WCAG compliant?</span>
        </button>
        <div id="acc-3" class="uds-accordion__content" role="region" hidden>
          <p>Yes. 108 automated contrast checks run on every build across all 9 palettes in light and dark modes.</p>
        </div>
      </div>
    </div>
  `,
};

export const Footer: StoryObj = {
  render: () => `
    <footer class="uds-footer uds-footer--standard" role="contentinfo">
      <div class="uds-footer__content" style="display: flex; justify-content: space-between; padding: 2rem;">
        <div class="uds-footer__brand">Universal Design System</div>
        <nav class="uds-footer__nav" aria-label="Footer navigation">
          <a class="uds-footer__link" href="#">Docs</a>
          <a class="uds-footer__link" href="#">Components</a>
          <a class="uds-footer__link" href="#">GitHub</a>
        </nav>
      </div>
      <div class="uds-footer__bottom" style="text-align: center; padding: 1rem;">
        <p>MIT License</p>
      </div>
    </footer>
  `,
};

export const Divider: StoryObj = {
  render: () => `
    <div style="max-width: 400px;">
      <p>Content above the divider</p>
      <hr class="uds-divider" role="separator" />
      <p>Content below the divider</p>
    </div>
  `,
};

export const Toast: StoryObj = {
  render: () => `
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 360px;">
      <div class="uds-toast uds-toast--success" role="status" aria-live="polite">
        <span class="uds-toast__message">File uploaded successfully</span>
        <button class="uds-toast__dismiss" aria-label="Dismiss">&times;</button>
      </div>
      <div class="uds-toast uds-toast--error" role="alert" aria-live="assertive">
        <span class="uds-toast__message">Network error. Please retry.</span>
        <button class="uds-toast__dismiss" aria-label="Dismiss">&times;</button>
      </div>
    </div>
  `,
};

export const DropdownMenu: StoryObj = {
  render: () => `
    <div class="uds-dropdown" style="position: relative; display: inline-block;">
      <button class="uds-btn uds-btn--secondary uds-btn--md uds-dropdown__trigger" aria-haspopup="true" aria-expanded="true">
        Options
      </button>
      <div class="uds-dropdown__menu" role="menu" style="position: absolute; top: 100%; left: 0; min-width: 160px;">
        <button class="uds-dropdown__item" role="menuitem">Edit</button>
        <button class="uds-dropdown__item" role="menuitem">Duplicate</button>
        <hr class="uds-divider" role="separator" />
        <button class="uds-dropdown__item uds-dropdown__item--destructive" role="menuitem">Delete</button>
      </div>
    </div>
  `,
};
