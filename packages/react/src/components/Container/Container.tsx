import React, { useEffect } from 'react';
import { warnIfNoTheme } from '../../utils/themeWarning';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max-width size. @default 'lg' */
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className, children, ...props }, ref) => {
    useEffect(() => {
      warnIfNoTheme();
    }, []);
    const classes = ['uds-container', `uds-container--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
