import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Menu } from '../../packages/react/src/components/Menu/Menu';

const sampleItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact' },
];

describe('Menu', () => {
  it('renders a nav element with aria-label', () => {
    render(<Menu items={sampleItems} />);
    const nav = screen.getByRole('navigation', { name: 'Menu' });
    expect(nav).toBeInTheDocument();
  });

  it('applies uds-menu class and default horizontal orientation', () => {
    render(<Menu items={sampleItems} />);
    const nav = screen.getByRole('navigation', { name: 'Menu' });
    expect(nav).toHaveClass('uds-menu', 'uds-menu--horizontal');
  });

  it('applies vertical orientation class', () => {
    render(<Menu items={sampleItems} orientation="vertical" />);
    const nav = screen.getByRole('navigation', { name: 'Menu' });
    expect(nav).toHaveClass('uds-menu--vertical');
  });

  it('renders items with href as anchor links', () => {
    render(<Menu items={sampleItems} />);
    const homeLink = screen.getByRole('menuitem', { name: 'Home' });
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders items without href as span elements', () => {
    render(<Menu items={sampleItems} />);
    const contactItem = screen.getByRole('menuitem', { name: 'Contact' });
    expect(contactItem.tagName).toBe('SPAN');
    expect(contactItem).toHaveAttribute('tabindex', '0');
  });

  it('marks the active item with aria-current and active class', () => {
    render(<Menu items={sampleItems} activeItemId="home" />);
    const homeLink = screen.getByRole('menuitem', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).toHaveClass('uds-menu__item--active');
  });

  it('does not mark non-active items with aria-current', () => {
    render(<Menu items={sampleItems} activeItemId="home" />);
    const aboutLink = screen.getByRole('menuitem', { name: 'About' });
    expect(aboutLink).not.toHaveAttribute('aria-current');
    expect(aboutLink).not.toHaveClass('uds-menu__item--active');
  });

  it('applies aria-disabled on disabled items', () => {
    const items = [{ id: 'disabled-item', label: 'Disabled', disabled: true }];
    render(<Menu items={items} />);
    const item = screen.getByRole('menuitem', { name: 'Disabled' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies a custom className', () => {
    render(<Menu items={sampleItems} className="custom-menu" />);
    const nav = screen.getByRole('navigation', { name: 'Menu' });
    expect(nav).toHaveClass('custom-menu');
  });

  it('renders all items', () => {
    render(<Menu items={sampleItems} />);
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3);
  });

  it('wraps each item in a div with role="none"', () => {
    const { container } = render(<Menu items={sampleItems} />);
    const wrappers = container.querySelectorAll('[role="none"]');
    expect(wrappers).toHaveLength(3);
  });

  it('has displayName', () => {
    expect(Menu.displayName).toBe('Menu');
  });
});
