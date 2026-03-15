import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (1–12). @default 1 */
  columns?: 1 | 2 | 3 | 4 | 12;
  /** Gap between cells. @default 'md' */
  gap?: 'sm' | 'md' | 'lg';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 1, gap = 'md', className, children, ...props }, ref) => {
    const classes = ['uds-grid', `uds-grid--cols-${columns}`, `uds-grid--gap-${gap}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Grid.displayName = 'Grid';
