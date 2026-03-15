import React from 'react';

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
  const classes = ['uds-notification', `uds-notification--${position}`, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="region" aria-label="Notifications">
      {items.map((item) => (
        <div
          key={item.id}
          className={`uds-notification__item uds-notification__item--${item.variant ?? 'neutral'}`}
          role="status"
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
        </div>
      ))}
    </div>
  );
};

Notification.displayName = 'Notification';
