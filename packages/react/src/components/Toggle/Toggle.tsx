import React, { useCallback } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: 'standard' | 'with-label';
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, variant = 'standard', label, disabled = false, className, id }, ref) => {
    const handleClick = useCallback(() => {
      if (!disabled) onChange(!checked);
    }, [checked, disabled, onChange]);

    const classes = [
      'uds-toggle',
      `uds-toggle--${variant}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={classes}>
        <button
          ref={ref}
          id={id}
          className="uds-toggle__track"
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleClick}
        >
          <span className="uds-toggle__thumb" aria-hidden="true" />
        </button>
        {label && variant === 'with-label' && (
          <span className="uds-toggle__label" onClick={handleClick}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
