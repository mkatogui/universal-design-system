import React, { useState, useCallback, useId } from 'react';

/**
 * Props for the {@link DatePicker} component.
 *
 * Extends native `<div>` attributes (with `onChange` replaced by a string callback).
 */
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selection mode. @default 'single' */
  variant?: 'single' | 'range' | 'with-time';
  /** Controls input sizing. @default 'md' */
  size?: 'md' | 'lg';
  /** Current date value (ISO string, e.g. "2024-01-15"). */
  value?: string;
  /** Earliest selectable date. */
  min?: string;
  /** Latest selectable date. */
  max?: string;
  /** Array of ISO date strings that cannot be selected. */
  disabledDates?: string[];
  /** BCP 47 locale for formatting (reserved for future use). */
  locale?: string;
  /** Called with the new date string when the user selects a date. */
  onChange?: (value: string) => void;
  /** Visible label above the date input. */
  label?: string;
  /** Disables the picker. */
  disabled?: boolean;
}

/**
 * A date picker built on a native `<input type="date">` (or
 * `datetime-local` when `variant="with-time"`).
 *
 * Includes an optional label and supports min/max/disabled constraints.
 *
 * Uses BEM class `uds-date-picker` with variant, size, and state modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <DatePicker label="Start date" value={date} onChange={setDate} min="2024-01-01" />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      variant = 'single',
      size = 'md',
      value,
      min,
      max,
      disabledDates,
      locale,
      onChange,
      label,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const inputId = useId();

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    const classes = [
      'uds-date-picker',
      `uds-date-picker--${variant}`,
      `uds-date-picker--${size}`,
      open && 'uds-date-picker--open',
      disabled && 'uds-date-picker--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputType = variant === 'with-time' ? 'datetime-local' : 'date';

    return (
      <div ref={ref} className={classes} {...props}>
        {label && (
          <label className="uds-date-picker__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          className="uds-date-picker__input"
          type={inputType}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-label={label || 'Select date'}
        />
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
