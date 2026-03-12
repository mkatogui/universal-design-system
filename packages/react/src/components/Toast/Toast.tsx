import React, { useEffect, useCallback } from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  message: string;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
  visible?: boolean;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'info', size = 'md', message, duration = 5000, action, onDismiss, visible = true, className, ...props }, ref) => {
    useEffect(() => {
      if (!visible || !duration || !onDismiss) return;
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }, [visible, duration, onDismiss]);

    const handleDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

    if (!visible) return null;

    const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

    const classes = [
      'uds-toast',
      `uds-toast--${variant}`,
      `uds-toast--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} role={role} {...props}>
        <p className="uds-toast__message">{message}</p>
        <div className="uds-toast__actions">
          {action}
          <button className="uds-toast__dismiss" onClick={handleDismiss} aria-label="Dismiss notification" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';
