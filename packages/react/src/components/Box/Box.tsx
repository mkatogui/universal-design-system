import React from 'react';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding (space token name or number). */
  padding?: string | number;
  /** Margin (space token name or number). */
  margin?: string | number;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ padding, margin, className, style, ...props }, ref) => {
    const resolvedStyle: React.CSSProperties = {
      ...style,
      ...(padding != null && {
        padding: typeof padding === 'number' ? `${padding}px` : `var(--space-${padding}, ${padding})`,
      }),
      ...(margin != null && {
        margin: typeof margin === 'number' ? `${margin}px` : `var(--space-${margin}, ${margin})`,
      }),
    };
    const classes = ['uds-box', className].filter(Boolean).join(' ');
    return <div ref={ref} className={classes} style={resolvedStyle} {...props} />;
  },
);

Box.displayName = 'Box';
