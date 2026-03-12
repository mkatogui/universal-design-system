import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Components/Composite',
  tags: ['autodocs'],
};

export default meta;

export const PricingTable: StoryObj = {
  render: () => `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 900px;">
      <div class="uds-pricing uds-pricing--basic">
        <div class="uds-pricing__header">
          <h3 class="uds-pricing__name">Free</h3>
          <div class="uds-pricing__price">$0<span class="uds-pricing__period">/mo</span></div>
        </div>
        <ul class="uds-pricing__features">
          <li>5 projects</li><li>1 GB storage</li><li>Community support</li>
        </ul>
        <button class="uds-btn uds-btn--secondary uds-btn--md uds-btn--full-width">Get Started</button>
      </div>
      <div class="uds-pricing uds-pricing--featured">
        <span class="uds-badge uds-badge--info uds-badge--sm">Most Popular</span>
        <div class="uds-pricing__header">
          <h3 class="uds-pricing__name">Pro</h3>
          <div class="uds-pricing__price">$29<span class="uds-pricing__period">/mo</span></div>
        </div>
        <ul class="uds-pricing__features">
          <li>Unlimited projects</li><li>100 GB storage</li><li>Priority support</li>
        </ul>
        <button class="uds-btn uds-btn--primary uds-btn--md uds-btn--full-width">Upgrade</button>
      </div>
      <div class="uds-pricing uds-pricing--enterprise">
        <div class="uds-pricing__header">
          <h3 class="uds-pricing__name">Enterprise</h3>
          <div class="uds-pricing__price">Custom</div>
        </div>
        <ul class="uds-pricing__features">
          <li>Unlimited everything</li><li>SLA guarantee</li><li>Dedicated support</li>
        </ul>
        <button class="uds-btn uds-btn--secondary uds-btn--md uds-btn--full-width">Contact Sales</button>
      </div>
    </div>
  `,
};

export const Testimonial: StoryObj = {
  render: () => `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 700px;">
      <figure class="uds-testimonial uds-testimonial--card">
        <blockquote class="uds-testimonial__quote">
          <p>"The reasoning engine saved us weeks of design decisions. We described our product and got a complete system."</p>
        </blockquote>
        <figcaption class="uds-testimonial__author">
          <cite class="uds-testimonial__name">Sarah Chen</cite>
          <span class="uds-testimonial__role">VP Design, FinCorp</span>
        </figcaption>
      </figure>
      <figure class="uds-testimonial uds-testimonial--card">
        <blockquote class="uds-testimonial__quote">
          <p>"WCAG compliance out of the box. No more manual audits for every palette change."</p>
        </blockquote>
        <figcaption class="uds-testimonial__author">
          <cite class="uds-testimonial__name">Marcus Johnson</cite>
          <span class="uds-testimonial__role">Lead Engineer, EduTech</span>
        </figcaption>
      </figure>
    </div>
  `,
};

export const FeatureSection: StoryObj = {
  render: () => `
    <section class="uds-feature" style="max-width: 800px;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2>Why teams choose UDS</h2>
        <p>Built for speed, accessibility, and domain intelligence.</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
        <div class="uds-card uds-card--icon-top">
          <div class="uds-card__header"><h3 class="uds-card__title">AI-Native</h3></div>
          <div class="uds-card__body"><p>BM25 reasoning engine with 17 databases and 1500+ data rows.</p></div>
        </div>
        <div class="uds-card uds-card--icon-top">
          <div class="uds-card__header"><h3 class="uds-card__title">Accessible</h3></div>
          <div class="uds-card__body"><p>108 WCAG 2.1 AA checks. Every palette, every mode, every build.</p></div>
        </div>
        <div class="uds-card uds-card--icon-top">
          <div class="uds-card__header"><h3 class="uds-card__title">Multi-Framework</h3></div>
          <div class="uds-card__body"><p>React, Vue, Svelte components. Tailwind CSS generation.</p></div>
        </div>
      </div>
    </section>
  `,
};

export const CTASection: StoryObj = {
  render: () => `
    <section class="uds-cta" style="text-align: center; padding: 3rem 2rem;">
      <h2>Ready to ship faster?</h2>
      <p style="max-width: 500px; margin: 1rem auto;">Describe your product. Get a complete design system. Zero config.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
        <button class="uds-btn uds-btn--primary uds-btn--lg">Get Started Free</button>
        <button class="uds-btn uds-btn--ghost uds-btn--lg">View Documentation</button>
      </div>
    </section>
  `,
};

export const CodeBlock: StoryObj = {
  render: () => `
    <div class="uds-code-block" style="max-width: 500px;">
      <div class="uds-code-block__header">
        <span class="uds-code-block__lang">bash</span>
        <button class="uds-code-block__copy" aria-label="Copy code">Copy</button>
      </div>
      <pre class="uds-code-block__pre"><code>npx @mkatogui/universal-design-system install
uds generate "fintech dashboard" --framework react</code></pre>
    </div>
  `,
};

export const CommandPalette: StoryObj = {
  render: () => `
    <div class="uds-command-palette" role="dialog" aria-label="Command palette" style="max-width: 500px; position: relative;">
      <div class="uds-command-palette__header">
        <input class="uds-command-palette__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmd-list" placeholder="Type a command..." value="search" />
      </div>
      <ul id="cmd-list" class="uds-command-palette__list" role="listbox">
        <li class="uds-command-palette__item uds-command-palette__item--active" role="option" aria-selected="true">Search components</li>
        <li class="uds-command-palette__item" role="option">Search palettes</li>
        <li class="uds-command-palette__item" role="option">Search tokens</li>
      </ul>
    </div>
  `,
};
