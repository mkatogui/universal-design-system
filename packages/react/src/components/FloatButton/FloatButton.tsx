import React from 'react';

export interface FloatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'primary' | 'extended';
  size?: 'md' | 'lg';
  'aria-label': string;
}

export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
  ({ position = 'bottom-right', variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const classes = [
      'uds-float-button',
      `uds-float-button--${position}`,
      `uds-float-button--${variant}`,
      `uds-float-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button ref={ref} type="button" className={classes} {...props}>
        {children}
      </button>
    );
  },
);

FloatButton.displayName = 'FloatButton';
