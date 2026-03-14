import React, { useCallback } from 'react';

/**
 * Props for the {@link Toggle} component.
 */
export interface ToggleProps {
  /** Current on/off state (controlled). */
  checked: boolean;
  /** Called with the new boolean value when the user toggles. */
  onChange: (checked: boolean) => void;
  /** Visual variant. `'with-label'` renders a visible text label beside the switch. @default 'standard' */
  variant?: 'standard' | 'with-label';
  /** Accessible label for the switch; also rendered visually when `variant='with-label'`. */
  label?: string;
  /** Disables interaction. */
  disabled?: boolean;
  /** Additional CSS class for the wrapper. */
  className?: string;
  /** HTML `id` for the underlying `<button>`. */
  id?: string;
}

/**
 * A toggle switch (`role="switch"`) for binary on/off settings.
 *
 * Renders a `<button>` with `role="switch"` and `aria-checked`,
 * following the WAI-ARIA Switch pattern. The component is fully
 * controlled via `checked` / `onChange`.
 *
 * Uses BEM class `uds-toggle` with variant modifiers.
 * Forwards its ref to the inner `<button>` element.
 *
 * @example
 * ```tsx
 * <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
 * ```
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, variant = 'standard', label, disabled = false, className, id }, ref) => {
    const handleClick = useCallback(() => {
      if (!disabled) onChange(!checked);
    }, [checked, disabled, onChange]);

    const classes = ['uds-toggle', `uds-toggle--${variant}`, className].filter(Boolean).join(' ');

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
          <button
            type="button"
            className="uds-toggle__label"
            tabIndex={-1}
            aria-hidden="true"
            onClick={handleClick}
          >
            {label}
          </button>
        )}
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';
