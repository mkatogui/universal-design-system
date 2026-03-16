import React from 'react';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: '16/9' | '1/1' | '4/3';
  children?: React.ReactNode;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = '16/9', className, children, ...props }, ref) => {
    const classes = ['uds-aspect-ratio', `uds-aspect-ratio--${ratio.replace('/', '-')}`, className]
      .filter(Boolean)
      .join(' ');
    const style: React.CSSProperties = { aspectRatio: ratio };
    return (
      <div ref={ref} className={classes} style={style} {...props}>
        {children}
      </div>
    );
  },
);

AspectRatio.displayName = 'AspectRatio';
