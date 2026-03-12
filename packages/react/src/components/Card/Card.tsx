import React from 'react';

/**
 * Props for the {@link Card} component.
 *
 * Extends native `<div>` attributes so every standard HTML div prop is also accepted.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout variant for the card. @default 'icon-top' */
  variant?: 'icon-top' | 'image-top' | 'horizontal' | 'stat-card' | 'dashboard-preview';
  /** Controls overall card sizing. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Icon element rendered at the top of the card. */
  icon?: React.ReactNode;
  /** Image URL rendered in the card header area. */
  image?: string;
  /** Alt text for the header image. */
  imageAlt?: string;
  /** Card heading text. */
  title?: string;
  /** Paragraph text below the title. */
  description?: string;
  /** URL for the "Learn more" link rendered at the bottom. */
  link?: string;
}

/**
 * A content card supporting multiple layouts (icon-top, image-top, etc.)
 * with optional title, description, image, icon, and link.
 *
 * Compose with {@link CardHeader}, {@link CardTitle}, {@link CardContent},
 * and {@link CardFooter} sub-components for custom layouts.
 *
 * Uses BEM class `uds-card` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Card variant="image-top" image="/hero.jpg" title="Feature" description="Details here" />
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'icon-top',
      size = 'md',
      icon,
      image,
      imageAlt,
      title,
      description,
      link,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = ['uds-card', `uds-card--${variant}`, `uds-card--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {image && <img className="uds-card__image" src={image} alt={imageAlt || ''} />}
        {icon && <div className="uds-card__icon">{icon}</div>}
        {title && <h3 className="uds-card__title">{title}</h3>}
        {description && <p className="uds-card__description">{description}</p>}
        {children}
        {link && (
          <a className="uds-card__link" href={link}>
            Learn more
          </a>
        )}
      </div>
    );
  },
);
Card.displayName = 'Card';

/** Card sub-component for the header area. */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={['uds-card__header', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

/** Card sub-component for the title (`<h3>`). */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={['uds-card__title', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

/** Card sub-component for the body content area. */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={['uds-card__content', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
CardContent.displayName = 'CardContent';

/** Card sub-component for the footer actions area. */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={['uds-card__footer', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  ),
);
CardFooter.displayName = 'CardFooter';
