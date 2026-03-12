import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'avatar' | 'table';
  size?: 'sm' | 'md' | 'lg';
  lines?: number;
  animated?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', size = 'md', lines = 3, animated = true, className, ...props }, ref) => {
    const classes = [
      'uds-skeleton',
      `uds-skeleton--${variant}`,
      `uds-skeleton--${size}`,
      animated && 'uds-skeleton--animated',
      className,
    ].filter(Boolean).join(' ');

    const renderContent = () => {
      switch (variant) {
        case 'avatar':
          return <div className="uds-skeleton__circle" aria-hidden="true" />;
        case 'card':
          return (
            <>
              <div className="uds-skeleton__image" aria-hidden="true" />
              <div className="uds-skeleton__lines" aria-hidden="true">
                {Array.from({ length: lines }, (_, i) => (
                  <div key={i} className="uds-skeleton__line" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
                ))}
              </div>
            </>
          );
        case 'table':
          return (
            <div className="uds-skeleton__table" aria-hidden="true">
              {Array.from({ length: lines }, (_, i) => (
                <div key={i} className="uds-skeleton__row">
                  <div className="uds-skeleton__cell" />
                  <div className="uds-skeleton__cell" />
                  <div className="uds-skeleton__cell" />
                </div>
              ))}
            </div>
          );
        default:
          return (
            <div className="uds-skeleton__lines" aria-hidden="true">
              {Array.from({ length: lines }, (_, i) => (
                <div key={i} className="uds-skeleton__line" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
              ))}
            </div>
          );
      }
    };

    return (
      <div ref={ref} className={classes} aria-busy="true" aria-hidden="true" {...props}>
        {renderContent()}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';
