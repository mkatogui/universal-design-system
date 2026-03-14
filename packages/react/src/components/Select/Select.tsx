import React from 'react';

/**
 * A single option inside a {@link Select} dropdown.
 */
export interface SelectOption {
  /** Value submitted with the form. */
  value: string;
  /** User-visible label. */
  label: string;
  /** Prevent selection of this option. */
  disabled?: boolean;
}

/**
 * Props for the {@link Select} component.
 *
 * Extends native `<select>` attributes (with `size` replaced by UDS sizing).
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Rendering mode. @default 'native' */
  variant?: 'native' | 'custom';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Array of options to render. */
  options: SelectOption[];
  /** Visible label rendered above the field. */
  label?: string;
  /** Placeholder option text (disabled, first option). */
  placeholder?: string;
  /** Marks the field as required. */
  required?: boolean;
  /** Error message displayed below the field; sets `aria-invalid`. */
  errorText?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
}

/**
 * A form select dropdown with optional label, placeholder, helper text,
 * and error state.
 *
 * Automatically wires `aria-invalid`, `aria-describedby`, and
 * `aria-required` for accessibility.
 *
 * Uses BEM class `uds-select` with variant, size, and error modifiers.
 * Forwards its ref to the underlying `<select>` element.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   placeholder="Choose..."
 *   options={[{ value: 'us', label: 'United States' }]}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = 'native',
      size = 'md',
      options,
      label,
      placeholder,
      required,
      errorText,
      helperText,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId =
      id || (label ? `uds-select-${label.toLowerCase().replaceAll(/\s+/g, '-')}` : undefined);
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;
    const describedBy = errorText ? errorId : helperText ? helperId : undefined;

    const classes = [
      'uds-select',
      `uds-select--${variant}`,
      `uds-select--${size}`,
      errorText && 'uds-select--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes}>
        {label && (
          <label className="uds-select__label" htmlFor={selectId}>
            {label}
            {required && (
              <span className="uds-select__required" aria-hidden="true">
                {' '}
                *
              </span>
            )}
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
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {errorText && (
          <p className="uds-select__error" id={errorId} role="alert">
            {errorText}
          </p>
        )}
        {!errorText && helperText && (
          <p className="uds-select__helper" id={helperId}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
