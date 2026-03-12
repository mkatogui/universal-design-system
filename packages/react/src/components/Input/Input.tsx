import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'text', size = 'md', label, helperText, errorText, required, className, id, ...props }, ref) => {
    const inputId = id || (label ? `uds-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const wrapperClasses = [
      'uds-input',
      `uds-input--${size}`,
      errorText && 'uds-input--error',
      className,
    ].filter(Boolean).join(' ');

    const describedBy = errorText ? errorId : helperText ? helperId : undefined;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className="uds-input__label" htmlFor={inputId}>
            {label}
            {required && <span className="uds-input__required" aria-hidden="true"> *</span>}
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
        {errorText && <p className="uds-input__error" id={errorId} role="alert">{errorText}</p>}
        {!errorText && helperText && <p className="uds-input__helper" id={helperId}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
