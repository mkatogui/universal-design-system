import React from 'react';

/**
 * Props for the {@link Testimonial} component.
 *
 * Extends native `<div>` attributes.
 */
export interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout variant. @default 'quote-card' */
  variant?: 'quote-card' | 'video' | 'metric' | 'carousel';
  /** Controls card sizing. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** The testimonial quote text. */
  quote?: string;
  /** URL of the author's avatar image. */
  avatar?: string;
  /** Author's full name. */
  name?: string;
  /** Author's job title. */
  title?: string;
  /** Author's company name. */
  company?: string;
  /** Star rating from 0 to 5. */
  rating?: number;
}

/**
 * A testimonial card displaying a customer quote with optional author
 * avatar, name, title, company, and star rating.
 *
 * Uses a `<blockquote>` for the quote and an accessible star-rating
 * widget with `aria-label`.
 *
 * Uses BEM class `uds-testimonial` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Testimonial
 *   quote="Incredible design system!"
 *   name="Jane Doe"
 *   title="CTO"
 *   company="Acme"
 *   rating={5}
 * />
 * ```
 */
export const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  (
    {
      variant = 'quote-card',
      size = 'md',
      quote,
      avatar,
      name,
      title,
      company,
      rating,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'uds-testimonial',
      `uds-testimonial--${variant}`,
      `uds-testimonial--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {quote && (
          <blockquote className="uds-testimonial__quote">
            <p>{quote}</p>
          </blockquote>
        )}
        {rating !== undefined && (
          <div
            className="uds-testimonial__rating"
            role="img"
            aria-label={`${rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, n) => n + 1).map((starNum) => (
              <span
                key={starNum}
                className={[
                  'uds-testimonial__star',
                  starNum <= rating && 'uds-testimonial__star--filled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                &#9733;
              </span>
            ))}
          </div>
        )}
        <div className="uds-testimonial__author">
          {avatar && (
            <img
              className="uds-testimonial__avatar"
              src={avatar}
              alt={name ? `${name}'s avatar` : ''}
            />
          )}
          <div className="uds-testimonial__info">
            {name && <cite className="uds-testimonial__name">{name}</cite>}
            {title && <span className="uds-testimonial__title">{title}</span>}
            {company && <span className="uds-testimonial__company">{company}</span>}
          </div>
        </div>
        {children}
      </div>
    );
  },
);

Testimonial.displayName = 'Testimonial';
