import React from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of flex layout. @default 'column' */
  direction?: 'row' | 'column';
  /** Gap between items (maps to --space-*). @default 'md' */
  gap?: 'sm' | 'md' | 'lg';
  /** Alignment of items. @default 'stretch' */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Allow wrapping. @default false */
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      gap = 'md',
      align = 'stretch',
      wrap = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'uds-stack',
      `uds-stack--${direction}`,
      `uds-stack--gap-${gap}`,
      align !== 'stretch' && `uds-stack--align-${align}`,
      wrap && 'uds-stack--wrap',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Stack.displayName = 'Stack';
