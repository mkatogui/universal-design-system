import React from 'react';

export interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'quote-card' | 'video' | 'metric' | 'carousel';
  size?: 'sm' | 'md' | 'lg';
  quote?: string;
  avatar?: string;
  name?: string;
  title?: string;
  company?: string;
  rating?: number;
}

export const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  ({ variant = 'quote-card', size = 'md', quote, avatar, name, title, company, rating, className, children, ...props }, ref) => {
    const classes = [
      'uds-testimonial',
      `uds-testimonial--${variant}`,
      `uds-testimonial--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {quote && (
          <blockquote className="uds-testimonial__quote">
            <p>{quote}</p>
          </blockquote>
        )}
        {rating !== undefined && (
          <div className="uds-testimonial__rating" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={['uds-testimonial__star', i < rating && 'uds-testimonial__star--filled'].filter(Boolean).join(' ')} aria-hidden="true">
                &#9733;
              </span>
            ))}
          </div>
        )}
        <div className="uds-testimonial__author">
          {avatar && <img className="uds-testimonial__avatar" src={avatar} alt={name ? `${name}'s avatar` : ''} />}
          <div className="uds-testimonial__info">
            {name && <cite className="uds-testimonial__name">{name}</cite>}
            {title && <span className="uds-testimonial__title">{title}</span>}
            {company && <span className="uds-testimonial__company">{company}</span>}
          </div>
        </div>
        {children}
      </div>
    );
  }
);

Testimonial.displayName = 'Testimonial';
