import React, { useCallback, useEffect } from 'react';

/**
 * Props for the {@link Toast} component.
 *
 * Extends native `<div>` attributes.
 */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Severity / colour variant. @default 'info' */
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** The notification message text. */
  message: string;
  /** Auto-dismiss delay in ms. Set to `0` to disable auto-dismiss. @default 5000 */
  duration?: number;
  /** Optional action element (e.g. an "Undo" button). */
  action?: React.ReactNode;
  /** Called when the toast is dismissed (auto or manual). */
  onDismiss?: () => void;
  /** Controls visibility. @default true */
  visible?: boolean;
}

/**
 * A non-modal notification toast that auto-dismisses after a configurable
 * duration.
 *
 * Sets `role="alert"` for error/warning and `role="status"` for
 * info/success/neutral. Includes a close button and optional action slot.
 *
 * Uses BEM class `uds-toast` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Toast variant="success" message="Saved!" onDismiss={clear} />
 * ```
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'info',
      size = 'md',
      message,
      duration = 5000,
      action,
      onDismiss,
      visible = true,
      className,
      ...props
    },
    ref,
  ) => {
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

    const classes = ['uds-toast', `uds-toast--${variant}`, `uds-toast--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} role={role} {...props}>
        <p className="uds-toast__message">{message}</p>
        <div className="uds-toast__actions">
          {action}
          <button
            className="uds-toast__dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);

Toast.displayName = 'Toast';
