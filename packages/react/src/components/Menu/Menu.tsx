import React from 'react';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  orientation?: 'horizontal' | 'vertical';
  activeItemId?: string;
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  items,
  orientation = 'horizontal',
  activeItemId,
  className,
}) => {
  const classes = ['uds-menu', `uds-menu--${orientation}`, className].filter(Boolean).join(' ');
  return (
    <nav className={classes} role="menubar" aria-label="Menu">
      {items.map((item) => (
        <div key={item.id} role="none">
          {item.href ? (
            <a
              href={item.href}
              role="menuitem"
              className={`uds-menu__item ${activeItemId === item.id ? 'uds-menu__item--active' : ''}`}
              aria-current={activeItemId === item.id ? 'page' : undefined}
              aria-disabled={item.disabled}
            >
              {item.label}
            </a>
          ) : (
            <span
              role="menuitem"
              className={`uds-menu__item ${activeItemId === item.id ? 'uds-menu__item--active' : ''}`}
              aria-disabled={item.disabled}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

Menu.displayName = 'Menu';
