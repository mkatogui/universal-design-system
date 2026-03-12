import React from 'react';

/**
 * Props for the {@link Navbar} component.
 *
 * Extends native `<nav>` attributes.
 */
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual theme of the navigation bar. @default 'standard' */
  variant?: 'standard' | 'minimal' | 'dark' | 'transparent';
  /** Viewport target. @default 'desktop' */
  size?: 'desktop' | 'mobile';
  /** Pin the navbar to the top of the viewport on scroll. */
  sticky?: boolean;
  /** Apply a backdrop-blur effect when the user scrolls. */
  blurOnScroll?: boolean;
  /** Call-to-action button rendered in the actions area. */
  ctaButton?: React.ReactNode;
  /** Dark-mode toggle rendered in the actions area. */
  darkModeToggle?: React.ReactNode;
  /** Logo element rendered at the start of the bar. */
  logo?: React.ReactNode;
  /** Controlled state for mobile menu open/close. */
  mobileOpen?: boolean;
  /** Called when the mobile hamburger button is clicked. */
  onMobileToggle?: () => void;
}

/**
 * A responsive top navigation bar with logo, menu links, actions, and
 * mobile hamburger toggle.
 *
 * Renders a `<nav>` with `aria-label="Main navigation"`. The mobile
 * menu is toggled via `mobileOpen` / `onMobileToggle`.
 *
 * Uses BEM class `uds-navbar` with variant, size, sticky, and blur modifiers.
 * Forwards its ref to the root `<nav>` element.
 *
 * @example
 * ```tsx
 * <Navbar logo={<Logo />} sticky>
 *   <a href="/features">Features</a>
 *   <a href="/pricing">Pricing</a>
 * </Navbar>
 * ```
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      variant = 'standard',
      size = 'desktop',
      sticky,
      blurOnScroll,
      ctaButton,
      darkModeToggle,
      logo,
      mobileOpen,
      onMobileToggle,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'uds-navbar',
      `uds-navbar--${variant}`,
      `uds-navbar--${size}`,
      sticky && 'uds-navbar--sticky',
      blurOnScroll && 'uds-navbar--blur',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={ref} className={classes} aria-label="Main navigation" {...props}>
        {logo && <div className="uds-navbar__logo">{logo}</div>}
        <button
          className="uds-navbar__mobile-toggle"
          onClick={onMobileToggle}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span className="uds-navbar__hamburger" aria-hidden="true" />
        </button>
        <div
          className={['uds-navbar__menu', mobileOpen && 'uds-navbar__menu--open']
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
        <div className="uds-navbar__actions">
          {darkModeToggle}
          {ctaButton}
        </div>
      </nav>
    );
  },
);

Navbar.displayName = 'Navbar';
