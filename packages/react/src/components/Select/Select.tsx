import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'native' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  errorText?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ variant = 'native', size = 'md', options, label, placeholder, required, errorText, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? `uds-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;
    const describedBy = errorText ? errorId : helperText ? helperId : undefined;

    const classes = [
      'uds-select',
      `uds-select--${variant}`,
      `uds-select--${size}`,
      errorText && 'uds-select--error',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={classes}>
        {label && (
          <label className="uds-select__label" htmlFor={selectId}>
            {label}
            {required && <span className="uds-select__required" aria-hidden="true"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className="uds-select__field"
          aria-invalid={!!errorText}
          aria-describedby={describedBy}
          aria-required={required}
          required={required}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {errorText && <p className="uds-select__error" id={errorId} role="alert">{errorText}</p>}
        {!errorText && helperText && <p className="uds-select__helper" id={helperId}>{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
