import React from 'react';

/**
 * Props for the {@link Input} component.
 *
 * Extends native `<input>` attributes (with `size` replaced by UDS sizing)
 * so every standard input prop is also accepted.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** The HTML input type, or `'textarea'` for multi-line input. @default 'text' */
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Visible label rendered above the field. Also used to derive the `id`. */
  label?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
  /** Error message displayed below the field; sets `aria-invalid`. */
  errorText?: string;
  /** Marks the field as required and shows an asterisk on the label. */
  required?: boolean;
}

/**
 * A form input field with optional label, helper text, and error state.
 *
 * Renders a `<textarea>` when `variant="textarea"`, otherwise a standard
 * `<input>`. Automatically wires `aria-invalid`, `aria-describedby`, and
 * `aria-required` for accessibility.
 *
 * Uses BEM class `uds-input` with size and error modifiers.
 * Forwards its ref to the underlying `<input>` (or `<textarea>`) element.
 *
 * @example
 * ```tsx
 * <Input label="Email" variant="email" errorText="Invalid address" />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'text',
      size = 'md',
      label,
      helperText,
      errorText,
      required,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? `uds-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const wrapperClasses = [
      'uds-input',
      `uds-input--${size}`,
      errorText && 'uds-input--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const describedBy = errorText ? errorId : helperText ? helperId : undefined;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className="uds-input__label" htmlFor={inputId}>
            {label}
            {required && (
              <span className="uds-input__required" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}
        {variant === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            className="uds-input__field"
            aria-invalid={!!errorText}
            aria-describedby={describedBy}
            aria-required={required}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            type={variant}
            className="uds-input__field"
            aria-invalid={!!errorText}
            aria-describedby={describedBy}
            aria-required={required}
            required={required}
            {...props}
          />
        )}
        {errorText && (
          <p className="uds-input__error" id={errorId} role="alert">
            {errorText}
          </p>
        )}
        {!errorText && helperText && (
          <p className="uds-input__helper" id={helperId}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
