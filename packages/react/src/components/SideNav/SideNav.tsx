import React, { useCallback } from 'react';

/**
 * A single navigation link in a {@link SideNav}.
 */
export interface SideNavItem {
  /** Visible link text. */
  label: string;
  /** Navigation target URL. */
  href?: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Mark this item as the active page. */
  active?: boolean;
  /** Nested sub-items (shown expanded when not collapsed). */
  children?: SideNavItem[];
}

/**
 * A labelled group of {@link SideNavItem}s.
 */
export interface SideNavSection {
  /** Section heading (hidden when collapsed). */
  title?: string;
  /** Items in this section. */
  items: SideNavItem[];
}

/**
 * Props for the {@link SideNav} component.
 *
 * Extends native `<nav>` attributes.
 */
export interface SideNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout variant. @default 'default' */
  variant?: 'default' | 'collapsed' | 'with-sections';
  /** Size preset. @default 'default' */
  size?: 'default' | 'collapsed';
  /** Flat list of navigation items. */
  items?: SideNavItem[];
  /** Grouped sections with headings. */
  sections?: SideNavSection[];
  /** Collapse the sidebar to icon-only mode. */
  collapsed?: boolean;
  /** `href` of the currently-active item (alternative to `SideNavItem.active`). */
  activeItem?: string;
  /** Called with the target `href` when a link is clicked. */
  onNavigate?: (href: string) => void;
}

/**
 * A vertical side navigation panel supporting flat lists or grouped
 * sections with optional collapse to icon-only mode.
 *
 * Renders a `<nav>` with `aria-label="Side navigation"`. Active items
 * receive `aria-current="page"`.
 *
 * Uses BEM class `uds-side-nav` with variant, size, and collapsed modifiers.
 * Forwards its ref to the root `<nav>` element.
 *
 * @example
 * ```tsx
 * <SideNav
 *   items={[
 *     { label: 'Dashboard', href: '/', icon: <DashIcon /> },
 *     { label: 'Settings', href: '/settings', icon: <GearIcon /> },
 *   ]}
 *   activeItem="/"
 * />
 * ```
 */
export const SideNav = React.forwardRef<HTMLElement, SideNavProps>(
  (
    {
      variant = 'default',
      size = 'default',
      items,
      sections,
      collapsed,
      activeItem,
      onNavigate,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const handleClick = useCallback(
      (href: string | undefined, e: React.MouseEvent) => {
        if (href && onNavigate) {
          e.preventDefault();
          onNavigate(href);
        }
      },
      [onNavigate],
    );

    const classes = [
      'uds-side-nav',
      `uds-side-nav--${variant}`,
      `uds-side-nav--${size}`,
      collapsed && 'uds-side-nav--collapsed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const renderItem = (item: SideNavItem, index: number) => {
      const isActive = item.active || item.href === activeItem;
      return (
        <li
          key={index}
          className={['uds-side-nav__item', isActive && 'uds-side-nav__item--active']
            .filter(Boolean)
            .join(' ')}
        >
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
          <ul className="uds-side-nav__list">{items.map((item, i) => renderItem(item, i))}</ul>
        ) : null}
        {children}
      </nav>
    );
  },
);

SideNav.displayName = 'SideNav';
