import React from 'react';

/** A single stat value (e.g. "10k+ users") displayed in a SocialProof stats counter. */
export interface SocialProofStat {
  /** The numeric/string value (e.g. "10k+"). */
  value: string;
  /** Descriptive label (e.g. "active users"). */
  label: string;
}

/** A company logo shown in a SocialProof logo strip. */
export interface SocialProofLogo {
  /** Image source URL. */
  src: string;
  /** Alt text for accessibility. */
  alt: string;
}

/** A mini-testimonial shown inside a SocialProof section. */
export interface SocialProofTestimonial {
  /** Quote text. */
  quote: string;
  /** Author name. */
  name: string;
  /** Author job title. */
  title?: string;
}

/**
 * Props for the {@link SocialProof} component.
 *
 * Extends native `<div>` attributes.
 */
export interface SocialProofProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Display variant. @default 'logo-strip' */
  variant?: 'logo-strip' | 'stats-counter' | 'testimonial-mini' | 'combined';
  /** Density of the section. @default 'standard' */
  size?: 'standard' | 'compact';
  /** Company logos to display. */
  logos?: SocialProofLogo[];
  /** Key metric stats to display. */
  stats?: SocialProofStat[];
  /** Mini-testimonials to display. */
  testimonials?: SocialProofTestimonial[];
}

/**
 * A social proof section that renders logo strips, stat counters,
 * and/or mini-testimonials to build trust.
 *
 * Uses BEM class `uds-social-proof` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <SocialProof
 *   variant="combined"
 *   logos={[{ src: '/acme.svg', alt: 'Acme' }]}
 *   stats={[{ value: '10k+', label: 'users' }]}
 * />
 * ```
 */
export const SocialProof = React.forwardRef<HTMLDivElement, SocialProofProps>(
  (
    {
      variant = 'logo-strip',
      size = 'standard',
      logos,
      stats,
      testimonials,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'uds-social-proof',
      `uds-social-proof--${variant}`,
      `uds-social-proof--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {logos && logos.length > 0 && (
          <div className="uds-social-proof__logos">
            {logos.map((logo) => (
              <img
                key={logo.src}
                className="uds-social-proof__logo"
                src={logo.src}
                alt={logo.alt}
              />
            ))}
          </div>
        )}
        {stats && stats.length > 0 && (
          <div className="uds-social-proof__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="uds-social-proof__stat">
                <span className="uds-social-proof__stat-value">{stat.value}</span>
                <span className="uds-social-proof__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
        {testimonials && testimonials.length > 0 && (
          <div className="uds-social-proof__testimonials">
            {testimonials.map((t) => (
              <div key={t.name} className="uds-social-proof__testimonial">
                <p className="uds-social-proof__quote">{t.quote}</p>
                <cite className="uds-social-proof__cite">
                  {t.name}
                  {t.title && `, ${t.title}`}
                </cite>
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
    );
  },
);

SocialProof.displayName = 'SocialProof';
