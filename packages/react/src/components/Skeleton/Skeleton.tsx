import React from 'react';

/**
 * Props for the {@link Skeleton} component.
 *
 * Extends native `<div>` attributes.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape of the loading placeholder. @default 'text' */
  variant?: 'text' | 'card' | 'avatar' | 'table';
  /** Controls overall dimensions. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Number of placeholder lines (or table rows). @default 3 */
  lines?: number;
  /** Animate with a shimmer pulse. @default true */
  animated?: boolean;
}

/**
 * A content-loading placeholder that renders pulsing skeleton shapes
 * while the real content is being fetched.
 *
 * Sets `aria-busy="true"` and `aria-hidden="true"` so screen readers
 * ignore the decorative placeholders.
 *
 * Uses BEM class `uds-skeleton` with variant, size, and animated modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Skeleton variant="card" lines={4} />
 * ```
 */
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
