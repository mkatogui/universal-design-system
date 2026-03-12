import React from 'react';

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'standard' | 'minimal' | 'dark' | 'transparent';
  size?: 'desktop' | 'mobile';
  sticky?: boolean;
  blurOnScroll?: boolean;
  ctaButton?: React.ReactNode;
  darkModeToggle?: React.ReactNode;
  logo?: React.ReactNode;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ variant = 'standard', size = 'desktop', sticky, blurOnScroll, ctaButton, darkModeToggle, logo, mobileOpen, onMobileToggle, className, children, ...props }, ref) => {
    const classes = [
      'uds-navbar',
      `uds-navbar--${variant}`,
      `uds-navbar--${size}`,
      sticky && 'uds-navbar--sticky',
      blurOnScroll && 'uds-navbar--blur',
      className,
    ].filter(Boolean).join(' ');

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
        <div className={['uds-navbar__menu', mobileOpen && 'uds-navbar__menu--open'].filter(Boolean).join(' ')}>
          {children}
        </div>
        <div className="uds-navbar__actions">
          {darkModeToggle}
          {ctaButton}
        </div>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';
