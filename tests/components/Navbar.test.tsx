import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Navbar } from '../../packages/react/src/components/Navbar/Navbar';

describe('Navbar', () => {
  it('renders a nav element with aria-label "Main navigation"', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('renders the logo when provided', () => {
    render(<Navbar logo={<span>Logo</span>} />);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders navigation link children', () => {
    render(
      <Navbar>
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
      </Navbar>,
    );
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pricing' })).toBeInTheDocument();
  });

  it('renders a mobile hamburger toggle button', () => {
    render(<Navbar />);
    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toBeInTheDocument();
  });

  it('calls onMobileToggle when the hamburger button is clicked', () => {
    const handleToggle = vi.fn();
    render(<Navbar onMobileToggle={handleToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation menu' }));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('sets aria-expanded to true on the mobile toggle when mobileOpen is true', () => {
    render(<Navbar mobileOpen={true} onMobileToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('sets aria-expanded to false on the mobile toggle when mobileOpen is false', () => {
    render(<Navbar mobileOpen={false} onMobileToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('applies the open modifier class to the menu when mobileOpen is true', () => {
    const { container } = render(<Navbar mobileOpen={true} />);
    expect(container.querySelector('.uds-navbar__menu')).toHaveClass('uds-navbar__menu--open');
  });

  it('does not apply open modifier class when mobileOpen is false', () => {
    const { container } = render(<Navbar mobileOpen={false} />);
    expect(container.querySelector('.uds-navbar__menu')).not.toHaveClass('uds-navbar__menu--open');
  });

  it('applies the sticky modifier class when sticky is true', () => {
    const { container } = render(<Navbar sticky />);
    expect(container.querySelector('.uds-navbar')).toHaveClass('uds-navbar--sticky');
  });

  it('applies the blur modifier class when blurOnScroll is true', () => {
    const { container } = render(<Navbar blurOnScroll />);
    expect(container.querySelector('.uds-navbar')).toHaveClass('uds-navbar--blur');
  });

  it('applies variant and size classes', () => {
    const { container } = render(<Navbar variant="dark" size="mobile" />);
    expect(container.querySelector('.uds-navbar')).toHaveClass('uds-navbar--dark');
    expect(container.querySelector('.uds-navbar')).toHaveClass('uds-navbar--mobile');
  });

  it('renders ctaButton and darkModeToggle in the actions area', () => {
    render(
      <Navbar
        ctaButton={<button>Get started</button>}
        darkModeToggle={<button>Dark mode</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('forwards a ref object to the nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Navbar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName.toLowerCase()).toBe('nav');
  });

  it('forwards a callback ref to the nav element', () => {
    const callbackRef = vi.fn();
    render(<Navbar ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0].tagName.toLowerCase()).toBe('nav');
  });
});
