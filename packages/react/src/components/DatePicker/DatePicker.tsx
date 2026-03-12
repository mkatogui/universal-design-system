import React, { useState, useCallback, useId } from 'react';

export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  variant?: 'single' | 'range' | 'with-time';
  size?: 'md' | 'lg';
  value?: string;
  min?: string;
  max?: string;
  disabledDates?: string[];
  locale?: string;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ variant = 'single', size = 'md', value, min, max, disabledDates, locale, onChange, label, disabled, className, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const inputId = useId();

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange]
    );

    const classes = [
      'uds-date-picker',
      `uds-date-picker--${variant}`,
      `uds-date-picker--${size}`,
      open && 'uds-date-picker--open',
      disabled && 'uds-date-picker--disabled',
      className,
    ].filter(Boolean).join(' ');

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
  }
);

DatePicker.displayName = 'DatePicker';
