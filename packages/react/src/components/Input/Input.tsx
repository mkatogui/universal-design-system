import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, inputSize = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `uds-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const fieldClasses = [
      'uds-input__field',
      `uds-input__field--${inputSize}`,
      error ? 'uds-input__field--error' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="uds-input">
        {label && (
          <label className="uds-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={fieldClasses} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined} {...props} />
        {error && <p className="uds-input__error" id={`${inputId}-error`} role="alert">{error}</p>}
        {!error && helperText && <p className="uds-input__helper" id={`${inputId}-helper`}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
