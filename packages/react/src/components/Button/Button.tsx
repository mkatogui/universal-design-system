import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'destructive' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, iconLeft, iconRight, className, children, disabled, ...props }, ref) => {
    const classes = [
      'uds-btn',
      `uds-btn--${variant}`,
      `uds-btn--${size}`,
      fullWidth && 'uds-btn--full-width',
      loading && 'uds-btn--loading',
      className,
    ].filter(Boolean).join(' ');

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
  }
);

Button.displayName = 'Button';
