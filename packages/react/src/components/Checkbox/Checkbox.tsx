import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  variant?: 'standard' | 'indeterminate';
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ variant = 'standard', label, indeterminate, checked, disabled, className, id, name, ...props }, ref) => {
    const inputId = id || (label ? `uds-checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const internalRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        if (node) {
          node.indeterminate = !!indeterminate;
        }
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref, indeterminate]
    );

    const classes = [
      'uds-checkbox',
      `uds-checkbox--${variant}`,
      indeterminate && 'uds-checkbox--indeterminate',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={classes}>
        <input
          ref={internalRef}
          id={inputId}
          type="checkbox"
          className="uds-checkbox__input"
          checked={checked}
          disabled={disabled}
          name={name}
          aria-checked={indeterminate ? 'mixed' : checked}
          {...props}
        />
        {label && (
          <label className="uds-checkbox__label" htmlFor={inputId}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
