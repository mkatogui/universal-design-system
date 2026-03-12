import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'status' | 'count' | 'tag';
  size?: 'sm' | 'md';
  label?: string;
  color?: string;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'status', size = 'md', label, color, removable, onRemove, className, children, ...props }, ref) => {
    const classes = [
      'uds-badge',
      `uds-badge--${variant}`,
      `uds-badge--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <span
        ref={ref}
        className={classes}
        style={color ? { '--uds-badge-color': color } as React.CSSProperties : undefined}
        aria-label={label || undefined}
        {...props}
      >
        {children || label}
        {removable && (
          <button
            className="uds-badge__remove"
            onClick={onRemove}
            aria-label={`Remove ${label || ''}`}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
