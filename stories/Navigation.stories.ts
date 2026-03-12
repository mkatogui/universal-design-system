import type { Meta, StoryObj } from '@storybook/html';

// Navbar
export const Navbar: StoryObj = {
  render: () => `
    <nav class="uds-navbar uds-navbar--standard" aria-label="Main navigation">
      <div class="uds-navbar__brand">Brand</div>
      <div class="uds-navbar__links">
        <a class="uds-navbar__link uds-navbar__link--active" href="#" aria-current="page">Home</a>
        <a class="uds-navbar__link" href="#">Features</a>
        <a class="uds-navbar__link" href="#">Pricing</a>
        <a class="uds-navbar__link" href="#">Docs</a>
      </div>
      <button class="uds-btn uds-btn--primary uds-btn--sm">Get Started</button>
    </nav>
  `,
};

// Sidebar / Side Navigation
export const Sidebar: StoryObj = {
  render: () => `
    <nav class="uds-side-nav" aria-label="Side navigation" style="width: 240px;">
      <div class="uds-side-nav__section">
        <span class="uds-side-nav__heading">Main</span>
        <a class="uds-side-nav__item uds-side-nav__item--active" href="#" aria-current="page">Dashboard</a>
        <a class="uds-side-nav__item" href="#">Analytics</a>
        <a class="uds-side-nav__item" href="#">Reports</a>
      </div>
      <div class="uds-side-nav__section">
        <span class="uds-side-nav__heading">Settings</span>
        <a class="uds-side-nav__item" href="#">Profile</a>
        <a class="uds-side-nav__item" href="#">Team</a>
        <a class="uds-side-nav__item" href="#">Billing</a>
      </div>
    </nav>
  `,
};

// Breadcrumb
export const Breadcrumb: StoryObj = {
  render: () => `
    <nav class="uds-breadcrumb" aria-label="Breadcrumb">
      <ol class="uds-breadcrumb__list">
        <li class="uds-breadcrumb__item"><a href="#">Home</a></li>
        <li class="uds-breadcrumb__item"><a href="#">Products</a></li>
        <li class="uds-breadcrumb__item" aria-current="page">Details</li>
      </ol>
    </nav>
  `,
};

// Pagination
export const Pagination: StoryObj = {
  render: () => `
    <nav class="uds-pagination" aria-label="Pagination">
      <button class="uds-pagination__btn" aria-label="Previous page" disabled>&laquo;</button>
      <button class="uds-pagination__btn uds-pagination__btn--active" aria-current="page" aria-label="Page 1">1</button>
      <button class="uds-pagination__btn" aria-label="Page 2">2</button>
      <button class="uds-pagination__btn" aria-label="Page 3">3</button>
      <button class="uds-pagination__btn" aria-label="Next page">&raquo;</button>
    </nav>
  `,
};

const meta: Meta = {
  title: 'Components/Navigation',
  tags: ['autodocs'],
};

export default meta;
