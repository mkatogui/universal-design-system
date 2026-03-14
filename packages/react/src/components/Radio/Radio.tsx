import React from 'react';

/**
 * Props for the {@link Radio} component.
 *
 * Extends native `<input>` attributes (with `type` and `size` omitted).
 */
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visual variant. @default 'standard' */
  variant?: 'standard' | 'card';
  /** Label text rendered next to the radio button. */
  label?: string;
}

/**
 * A radio button input with an optional visible label.
 *
 * Group multiple `Radio` components with the same `name` prop to form
 * a radio group. Sets `aria-checked` for explicit state communication.
 *
 * Uses BEM class `uds-radio` with variant modifiers.
 * Forwards its ref to the underlying `<input type="radio">` element.
 *
 * @example
 * ```tsx
 * <Radio name="plan" value="free" label="Free" />
 * <Radio name="plan" value="pro" label="Pro" />
 * ```
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    { variant = 'standard', label, checked, disabled, className, id, name, value, ...props },
    ref,
  ) => {
    const inputId =
      id ||
      (label
        ? `uds-radio-${name}-${String(value).toLowerCase().replaceAll(/\s+/g, '-')}`
        : undefined);

    const classes = ['uds-radio', `uds-radio--${variant}`, className].filter(Boolean).join(' ');

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
  },
);

Radio.displayName = 'Radio';
