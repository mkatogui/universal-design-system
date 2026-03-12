import React from 'react';

/**
 * Props for the {@link Badge} component.
 *
 * Extends native `<span>` attributes.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style of the badge. @default 'status' */
  variant?: 'status' | 'count' | 'tag';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md';
  /** Accessible label text; also used as visible fallback when no children. */
  label?: string;
  /** Custom CSS color value applied via `--uds-badge-color`. */
  color?: string;
  /** Show a remove button inside the badge. */
  removable?: boolean;
  /** Called when the remove button is clicked. */
  onRemove?: () => void;
}

/**
 * A small status indicator, counter, or tag badge.
 *
 * Optionally includes a remove button for tag-style badges.
 * Uses BEM class `uds-badge` with variant and size modifiers.
 * Forwards its ref to the root `<span>` element.
 *
 * @example
 * ```tsx
 * <Badge variant="status" color="green">Active</Badge>
 * <Badge variant="count">42</Badge>
 * ```
 */
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
