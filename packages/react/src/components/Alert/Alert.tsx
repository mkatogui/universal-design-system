import React, { useState } from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

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
