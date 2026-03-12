import React from 'react';

/**
 * Props for the {@link Avatar} component.
 *
 * Extends native `<div>` attributes.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Display mode. @default 'image' */
  variant?: 'image' | 'initials' | 'icon' | 'group';
  /** Controls the avatar dimensions. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Image source URL (for `variant='image'`). */
  src?: string;
  /** Alt text for the avatar image; also used as `aria-label`. */
  alt?: string;
  /** One or two initials shown when no image is available. */
  initials?: string;
  /** Online presence indicator. */
  status?: 'online' | 'offline' | 'busy';
  /** Custom fallback element when neither `src` nor `initials` is set. */
  fallback?: React.ReactNode;
}

/**
 * A user avatar that gracefully falls back from image to initials to
 * a generic placeholder icon.
 *
 * Handles `<img>` load errors by automatically switching to the
 * initials or fallback view. Optionally displays an online-status
 * badge.
 *
 * Uses BEM class `uds-avatar` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Avatar src="/me.jpg" alt="Jane Doe" status="online" />
 * <Avatar initials="JD" size="lg" />
 * ```
 */
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
