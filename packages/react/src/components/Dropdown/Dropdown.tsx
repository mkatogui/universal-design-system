import type React from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * A single item inside a {@link Dropdown} menu.
 */
export interface DropdownItem {
  /** User-visible text. */
  label: string;
  /** Value passed to `onSelect` when chosen. */
  value: string;
  /** Prevent selection of this item. */
  disabled?: boolean;
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

/**
 * Props for the {@link Dropdown} component.
 */
export interface DropdownProps {
  /** Semantic purpose of the dropdown. @default 'action' */
  variant?: 'action' | 'context' | 'nav-sub';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Menu items to render. */
  items: DropdownItem[];
  /** Trigger element (usually a button) that opens the menu. */
  trigger: React.ReactNode;
  /** Called with the selected item's value. */
  onSelect?: (value: string) => void;
  /** Menu alignment relative to the trigger. @default 'bottom-start' */
  position?: 'bottom-start' | 'bottom-end';
  /** Additional CSS class for the wrapper. */
  className?: string;
}

/**
 * An accessible dropdown menu triggered by a button.
 *
 * Features:
 * - `aria-haspopup="menu"` and `aria-expanded` on the trigger
 * - `role="menu"` / `role="menuitem"` structure
 * - Arrow-key navigation, Escape to close, Enter/Space to select
 * - Closes on outside click
 *
 * Uses BEM class `uds-dropdown` with variant, size, and position modifiers.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger="Actions"
 *   items={[{ label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }]}
 *   onSelect={handleAction}
 * />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  variant = 'action',
  size = 'md',
  items,
  trigger,
  onSelect,
  position = 'bottom-start',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const enabledIndices = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActiveIndex(enabledIndices[0] ?? -1);
        } else {
          const pos = enabledIndices.indexOf(activeIndex);
          setActiveIndex(enabledIndices[(pos + 1) % enabledIndices.length]);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const pos = enabledIndices.indexOf(activeIndex);
        setActiveIndex(enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length]);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (open && activeIndex >= 0 && !items[activeIndex].disabled) {
          onSelect?.(items[activeIndex].value);
          close();
        } else {
          setOpen(true);
          setActiveIndex(enabledIndices[0] ?? -1);
        }
      }
    },
    [open, activeIndex, items, onSelect, close],
  );

  const classes = [
    'uds-dropdown',
    `uds-dropdown--${variant}`,
    `uds-dropdown--${size}`,
    `uds-dropdown--${position}`,
    open && 'uds-dropdown--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={menuRef} className={classes} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        className="uds-dropdown__trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div id={menuId} className="uds-dropdown__menu" role="menu">
          {items.map((item, index) => (
            <button
              key={item.value}
              className={[
                'uds-dropdown__item',
                index === activeIndex && 'uds-dropdown__item--active',
              ]
                .filter(Boolean)
                .join(' ')}
              role="menuitem"
              disabled={item.disabled}
              tabIndex={-1}
              onClick={() => {
                onSelect?.(item.value);
                close();
              }}
            >
              {item.icon && <span className="uds-dropdown__item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';
