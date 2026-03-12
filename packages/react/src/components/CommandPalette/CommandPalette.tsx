import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * A single action/command available in the {@link CommandPalette}.
 */
export interface CommandPaletteAction {
  /** Unique identifier for this action. */
  id: string;
  /** User-visible label (searchable). */
  label: string;
  /** Group id this action belongs to. */
  group?: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Keyboard shortcut hint displayed on the right. */
  shortcut?: string;
  /** Prevent selection of this action. */
  disabled?: boolean;
}

/**
 * A named group header for organising {@link CommandPaletteAction}s.
 */
export interface CommandPaletteGroup {
  /** Group heading text. */
  label: string;
  /** Unique group identifier. */
  id: string;
}

/**
 * Props for the {@link CommandPalette} component.
 *
 * Extends native `<div>` attributes (with `onSelect` replaced).
 */
export interface CommandPaletteProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Whether the command palette is currently visible. */
  open: boolean;
  /** Called when the palette should close (Escape, overlay click). */
  onClose: () => void;
  /** Width constraint. @default 'md' */
  size?: 'md' | 'lg';
  /** Searchable action items. */
  actions: CommandPaletteAction[];
  /** Optional group definitions for organizing actions. */
  groups?: CommandPaletteGroup[];
  /** Called with the selected action's id. */
  onSelect: (actionId: string) => void;
  /** Placeholder text in the search input. @default 'Type a command...' */
  placeholder?: string;
  /** Maximum number of recent actions to show (reserved for future use). */
  recentLimit?: number;
}

/**
 * A keyboard-first command palette overlay (Cmd+K / Ctrl+K style).
 *
 * Features:
 * - Real-time fuzzy-ish filtering of actions by label
 * - `role="combobox"` / `role="listbox"` / `role="option"` ARIA pattern
 * - Arrow-key navigation, Enter to select, Escape to close
 * - Auto-focuses the search input when opened
 * - Grouped actions with section headers
 *
 * Uses BEM class `uds-command-palette` with size modifiers.
 * Forwards its ref to the palette panel `<div>`.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={isOpen}
 *   onClose={() => setOpen(false)}
 *   actions={[{ id: 'save', label: 'Save file', shortcut: 'Cmd+S' }]}
 *   onSelect={runAction}
 * />
 * ```
 */
export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open,
      onClose,
      size = 'md',
      actions,
      groups,
      onSelect,
      placeholder = 'Type a command...',
      recentLimit,
      className,
      ...props
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();

    const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
      if (open) {
        setQuery('');
        setActiveIndex(0);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const item = filtered[activeIndex];
          if (item && !item.disabled) {
            onSelect(item.id);
            onClose();
          }
        }
      },
      [filtered, activeIndex, onSelect, onClose],
    );

    if (!open) return null;

    const classes = ['uds-command-palette', `uds-command-palette--${size}`, className]
      .filter(Boolean)
      .join(' ');

    const groupedActions = groups
      ? groups.map((g) => ({
          ...g,
          actions: filtered.filter((a) => a.group === g.id),
        }))
      : [{ id: 'all', label: '', actions: filtered }];

    return (
      <div
        className="uds-command-palette-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      >
        <div
          ref={ref}
          className={classes}
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
          aria-owns={listboxId}
          {...props}
        >
          <div className="uds-command-palette__input-wrapper">
            <input
              ref={inputRef}
              className="uds-command-palette__input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role="searchbox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={
                filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined
              }
            />
          </div>
          <div id={listboxId} className="uds-command-palette__list" role="listbox">
            {groupedActions.map((group) => (
              <div key={group.id} className="uds-command-palette__group">
                {group.label && (
                  <div className="uds-command-palette__group-label">{group.label}</div>
                )}
                {group.actions.map((action, _i) => {
                  const globalIndex = filtered.indexOf(action);
                  return (
                    <div
                      key={action.id}
                      id={`cmd-${action.id}`}
                      className={[
                        'uds-command-palette__item',
                        globalIndex === activeIndex && 'uds-command-palette__item--active',
                        action.disabled && 'uds-command-palette__item--disabled',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="option"
                      aria-selected={globalIndex === activeIndex}
                      aria-disabled={action.disabled}
                      onClick={() => {
                        if (!action.disabled) {
                          onSelect(action.id);
                          onClose();
                        }
                      }}
                    >
                      {action.icon && (
                        <span className="uds-command-palette__item-icon">{action.icon}</span>
                      )}
                      <span className="uds-command-palette__item-label">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="uds-command-palette__item-shortcut">{action.shortcut}</kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="uds-command-palette__empty">No results found</div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
