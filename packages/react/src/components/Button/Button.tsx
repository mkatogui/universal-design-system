import React from 'react';

/**
 * Props for the {@link Button} component.
 *
 * Extends native `<button>` attributes so every standard HTML button prop
 * (e.g. `type`, `aria-label`, `form`) is also accepted.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'destructive' | 'icon-only';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** When `true`, shows a spinner and disables interaction. */
  loading?: boolean;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Icon rendered before the button label. */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the button label. */
  iconRight?: React.ReactNode;
}

/**
 * A polymorphic action button that supports multiple visual variants,
 * sizes, loading state, and optional leading/trailing icons.
 *
 * Uses BEM class `uds-btn` with variant and size modifiers.
 * Forwards its ref to the underlying `<button>` element.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={save}>
 *   Save changes
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      iconLeft,
      iconRight,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'uds-btn',
      `uds-btn--${variant}`,
      `uds-btn--${size}`,
      fullWidth && 'uds-btn--full-width',
      loading && 'uds-btn--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {loading && <span className="uds-btn__spinner" aria-hidden="true" />}
        {iconLeft && <span className="uds-btn__icon-left">{iconLeft}</span>}
        {children}
        {iconRight && <span className="uds-btn__icon-right">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
