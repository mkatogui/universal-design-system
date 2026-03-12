import React, { useCallback } from 'react';

export interface SideNavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  children?: SideNavItem[];
}

export interface SideNavSection {
  title?: string;
  items: SideNavItem[];
}

export interface SideNavProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'collapsed' | 'with-sections';
  size?: 'default' | 'collapsed';
  items?: SideNavItem[];
  sections?: SideNavSection[];
  collapsed?: boolean;
  activeItem?: string;
  onNavigate?: (href: string) => void;
}

export const SideNav = React.forwardRef<HTMLElement, SideNavProps>(
  ({ variant = 'default', size = 'default', items, sections, collapsed, activeItem, onNavigate, className, children, ...props }, ref) => {
    const handleClick = useCallback(
      (href: string | undefined, e: React.MouseEvent) => {
        if (href && onNavigate) {
          e.preventDefault();
          onNavigate(href);
        }
      },
      [onNavigate]
    );

    const classes = [
      'uds-side-nav',
      `uds-side-nav--${variant}`,
      `uds-side-nav--${size}`,
      collapsed && 'uds-side-nav--collapsed',
      className,
    ].filter(Boolean).join(' ');

    const renderItem = (item: SideNavItem, index: number) => {
      const isActive = item.active || item.href === activeItem;
      return (
        <li key={index} className={['uds-side-nav__item', isActive && 'uds-side-nav__item--active'].filter(Boolean).join(' ')}>
          <a
            className="uds-side-nav__link"
            href={item.href || '#'}
            onClick={(e) => handleClick(item.href, e)}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon && <span className="uds-side-nav__icon">{item.icon}</span>}
            {!collapsed && <span className="uds-side-nav__label">{item.label}</span>}
          </a>
          {item.children && item.children.length > 0 && !collapsed && (
            <ul className="uds-side-nav__sublist" aria-expanded="true">
              {item.children.map((child, i) => renderItem(child, i))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <nav ref={ref} className={classes} aria-label="Side navigation" {...props}>
        {sections ? (
          sections.map((section, si) => (
            <div key={si} className="uds-side-nav__section">
              {section.title && !collapsed && (
                <h3 className="uds-side-nav__section-title">{section.title}</h3>
              )}
              <ul className="uds-side-nav__list">
                {section.items.map((item, i) => renderItem(item, i))}
              </ul>
            </div>
          ))
        ) : items ? (
          <ul className="uds-side-nav__list">
            {items.map((item, i) => renderItem(item, i))}
          </ul>
        ) : null}
        {children}
      </nav>
    );
  }
);

SideNav.displayName = 'SideNav';
