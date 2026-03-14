import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9\-_]/g, '_');
}

export interface ComboboxOption {
  /** Unique identifier for this option. */
  value: string;
  /** User-visible label. */
  label: string;
  /** Prevent selection of this option. */
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Visible label text. */
  label: string;
  /** Available options. */
  options: ComboboxOption[];
  /** Currently selected value(s). */
  value?: string | string[];
  /** Called when the selection changes. */
  onSelect: (value: string | string[]) => void;
  /** Placeholder text for the input. @default 'Search...' */
  placeholder?: string;
  /** Combobox variant. @default 'autocomplete' */
  variant?: 'autocomplete' | 'multiselect' | 'creatable';
  /** Error message to display. */
  errorText?: string;
  /** Whether the combobox is disabled. */
  disabled?: boolean;
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      label,
      options,
      value,
      onSelect,
      placeholder = 'Search...',
      variant = 'autocomplete',
      errorText,
      disabled,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();
    const labelId = useId();
    const errorId = useId();

    const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

    let selectedValues: string[];
    if (Array.isArray(value)) {
      selectedValues = value;
    } else if (value) {
      selectedValues = [value];
    } else {
      selectedValues = [];
    }

    const handleSelect = useCallback(
      (optionValue: string) => {
        if (variant === 'multiselect') {
          const next = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue];
          onSelect(next);
        } else {
          onSelect(optionValue);
          setIsOpen(false);
          setQuery(options.find((o) => o.value === optionValue)?.label ?? '');
        }
      },
      [variant, selectedValues, onSelect, options],
    );

    const handleCreate = useCallback(() => {
      if (variant === 'creatable' && query.trim()) {
        onSelect(query.trim());
        setIsOpen(false);
      }
    }, [variant, query, onSelect]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (isOpen) {
            setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          } else {
            setIsOpen(true);
            setActiveIndex(0);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex >= 0 && filtered[activeIndex] && !filtered[activeIndex].disabled) {
            handleSelect(filtered[activeIndex].value);
          } else if (variant === 'creatable' && filtered.length === 0) {
            handleCreate();
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      },
      [isOpen, filtered, activeIndex, handleSelect, handleCreate, variant],
    );

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          inputRef.current &&
          !inputRef.current.contains(e.target as Node) &&
          listboxRef.current &&
          !listboxRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const classes = [
      'uds-combobox',
      `uds-combobox--${variant}`,
      `uds-combobox--${size}`,
      errorText && 'uds-combobox--error',
      disabled && 'uds-combobox--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        <label id={labelId} htmlFor={`${listboxId}-input`} className="uds-combobox__label">
          {label}
        </label>
        <div className="uds-combobox__input-wrapper">
          <input
            ref={inputRef}
            id={`${listboxId}-input`}
            className="uds-combobox__input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-labelledby={labelId}
            aria-activedescendant={
              activeIndex >= 0 && filtered[activeIndex]
                ? `${listboxId}-opt-${sanitizeId(filtered[activeIndex].value)}`
                : undefined
            }
            aria-invalid={errorText ? true : undefined}
            aria-describedby={errorText ? errorId : undefined}
            disabled={disabled}
          />
        </div>
        {isOpen && (
          <div
            ref={listboxRef}
            id={listboxId}
            className="uds-combobox__listbox"
            role="listbox"
            aria-labelledby={labelId}
            aria-multiselectable={variant === 'multiselect' ? true : undefined}
          >
            {filtered.map((option, index) => (
              <div
                key={option.value}
                id={`${listboxId}-opt-${sanitizeId(option.value)}`}
                className={[
                  'uds-combobox__option',
                  index === activeIndex && 'uds-combobox__option--active',
                  option.disabled && 'uds-combobox__option--disabled',
                  selectedValues.includes(option.value) && 'uds-combobox__option--selected',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="option"
                aria-selected={selectedValues.includes(option.value)}
                aria-disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) handleSelect(option.value);
                }}
              >
                {option.label}
              </div>
            ))}
            {filtered.length === 0 && variant === 'creatable' && query.trim() && (
              <div
                className="uds-combobox__option uds-combobox__option--create"
                role="option"
                aria-selected={false}
                onClick={handleCreate}
              >
                Create &ldquo;{query.trim()}&rdquo;
              </div>
            )}
            {filtered.length === 0 && variant !== 'creatable' && (
              <div className="uds-combobox__empty">No results found</div>
            )}
          </div>
        )}
        {errorText && (
          <div id={errorId} className="uds-combobox__error" role="alert">
            {errorText}
          </div>
        )}
      </div>
    );
  },
);

Combobox.displayName = 'Combobox';
