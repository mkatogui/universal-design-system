import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  variant?: 'standard' | 'card';
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ variant = 'standard', label, checked, disabled, className, id, name, value, ...props }, ref) => {
    const inputId = id || (label ? `uds-radio-${name}-${String(value).toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const classes = [
      'uds-radio',
      `uds-radio--${variant}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={classes}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="uds-radio__input"
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
          aria-checked={checked}
          {...props}
        />
        {label && (
          <label className="uds-radio__label" htmlFor={inputId}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
