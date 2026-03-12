import React from 'react';

/**
 * Props for the {@link Checkbox} component.
 *
 * Extends native `<input>` attributes (with `type` and `size` omitted).
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visual variant. @default 'standard' */
  variant?: 'standard' | 'indeterminate';
  /** Label text rendered next to the checkbox. */
  label?: string;
  /** Set the checkbox to the indeterminate (mixed) state. */
  indeterminate?: boolean;
}

/**
 * A checkbox input with an optional visible label and support for
 * the indeterminate (mixed) state.
 *
 * Sets `aria-checked="mixed"` when indeterminate. Imperatively
 * sets `HTMLInputElement.indeterminate` via a callback ref.
 *
 * Uses BEM class `uds-checkbox` with variant modifiers.
 * Forwards its ref to the underlying `<input type="checkbox">` element.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" checked={accepted} onChange={toggle} />
 * ```
 */
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
