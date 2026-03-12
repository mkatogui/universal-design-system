import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'image' | 'initials' | 'icon' | 'group';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  initials?: string;
  status?: 'online' | 'offline' | 'busy';
  fallback?: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ variant = 'image', size = 'md', src, alt, initials, status, fallback, className, children, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);

    const classes = [
      'uds-avatar',
      `uds-avatar--${variant}`,
      `uds-avatar--${size}`,
      className,
    ].filter(Boolean).join(' ');

    const renderContent = () => {
      if (variant === 'group') return children;
      if (src && !imgError) {
        return <img className="uds-avatar__image" src={src} alt={alt || ''} onError={() => setImgError(true)} />;
      }
      if (initials) {
        return <span className="uds-avatar__initials">{initials}</span>;
      }
      if (fallback) return fallback;
      return <span className="uds-avatar__fallback" aria-hidden="true" />;
    };

    return (
      <div ref={ref} className={classes} aria-label={alt || initials || undefined} {...props}>
        {renderContent()}
        {status && (
          <span className={`uds-avatar__status uds-avatar__status--${status}`} aria-label={status} />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
