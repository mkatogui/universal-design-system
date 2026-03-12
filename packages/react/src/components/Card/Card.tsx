import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'icon-top' | 'image-top' | 'horizontal' | 'stat-card' | 'dashboard-preview';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  link?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'icon-top', size = 'md', icon, image, imageAlt, title, description, link, className, children, ...props }, ref) => {
    const classes = [
      'uds-card',
      `uds-card--${variant}`,
      `uds-card--${size}`,
      className,
    ].filter(Boolean).join(' ');

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
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={['uds-card__header', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={['uds-card__title', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={['uds-card__content', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={['uds-card__footer', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
