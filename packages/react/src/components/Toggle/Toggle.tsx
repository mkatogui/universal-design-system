import React, { useCallback } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, label, disabled = false, className = '', id }, ref) => {
    const handleClick = useCallback(() => {
      if (!disabled) onChange(!checked);
    }, [checked, disabled, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }
      },
      [checked, disabled, onChange]
    );

    return (
      <div className={`uds-toggle ${className}`.trim()}>
        <button
          ref={ref}
          id={id}
          className="uds-toggle__track"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span className="uds-toggle__thumb" aria-hidden="true" />
        </button>
        {label && (
          <span className="uds-toggle__label" onClick={handleClick}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
