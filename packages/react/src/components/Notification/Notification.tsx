import type React from 'react';

export interface NotificationItem {
  id: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
}

export interface NotificationProps {
  items: NotificationItem[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onDismiss?: (id: string) => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  items,
  position = 'top-right',
  onDismiss,
  className,
}) => {
  const classes = ['uds-notification', `uds-notification--${position}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={classes} aria-label="Notifications">
      {items.map((item) => (
        <output
          key={item.id}
          className={`uds-notification__item uds-notification__item--${item.variant ?? 'neutral'}`}
          htmlFor=""
        >
          <span className="uds-notification__message">{item.message}</span>
          {onDismiss && (
            <button
              type="button"
              className="uds-notification__dismiss"
              aria-label="Dismiss"
              onClick={() => onDismiss(item.id)}
            >
              ×
            </button>
          )}
        </output>
      ))}
    </section>
  );
};

Notification.displayName = 'Notification';
