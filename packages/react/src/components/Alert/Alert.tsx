import React, { useState } from 'react';

/**
 * Props for the {@link Alert} component.
 *
 * Extends native `<div>` attributes.
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Severity level controlling colour and ARIA role. @default 'info' */
  variant?: 'success' | 'warning' | 'error' | 'info';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Bold heading rendered above the message. */
  title?: string;
  /** Body text of the alert. */
  message?: string;
  /** Show a dismiss button. @default false */
  dismissible?: boolean;
  /** Called after the alert is dismissed. */
  onDismiss?: () => void;
}

/**
 * An inline alert banner for feedback messages (info, success, warning, error).
 *
 * Sets `role="alert"` for error/warning and `role="status"` for info/success.
 * When `dismissible` is `true`, the user can close it; the component
 * manages its own visibility via internal state.
 *
 * Uses BEM class `uds-alert` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Alert variant="error" title="Oops" message="Something went wrong." dismissible />
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', size = 'md', title, message, dismissible = false, onDismiss, className, children, ...props }, ref) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

    const classes = [
      'uds-alert',
      `uds-alert--${variant}`,
      `uds-alert--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} role={role} {...props}>
        <div className="uds-alert__content">
          {title && <div className="uds-alert__title">{title}</div>}
          {message && <p className="uds-alert__message">{message}</p>}
          {children}
        </div>
        {dismissible && (
          <button className="uds-alert__dismiss" onClick={handleDismiss} aria-label="Dismiss alert" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
