import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant. @default 'line' */
  variant?: 'line' | 'dashed';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', variant = 'line', className, ...props }, ref) => {
    const classes = [
      'uds-divider',
      `uds-divider--${orientation}`,
      variant === 'dashed' && 'uds-divider--dashed',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return <hr ref={ref} className={classes} role="separator" {...props} />;
  },
);

Divider.displayName = 'Divider';
