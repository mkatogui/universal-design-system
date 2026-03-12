import React from 'react';

export interface SocialProofStat {
  value: string;
  label: string;
}

export interface SocialProofLogo {
  src: string;
  alt: string;
}

export interface SocialProofTestimonial {
  quote: string;
  name: string;
  title?: string;
}

export interface SocialProofProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'logo-strip' | 'stats-counter' | 'testimonial-mini' | 'combined';
  size?: 'standard' | 'compact';
  logos?: SocialProofLogo[];
  stats?: SocialProofStat[];
  testimonials?: SocialProofTestimonial[];
}

export const SocialProof = React.forwardRef<HTMLDivElement, SocialProofProps>(
  ({ variant = 'logo-strip', size = 'standard', logos, stats, testimonials, className, children, ...props }, ref) => {
    const classes = [
      'uds-social-proof',
      `uds-social-proof--${variant}`,
      `uds-social-proof--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {logos && logos.length > 0 && (
          <div className="uds-social-proof__logos">
            {logos.map((logo, i) => (
              <img key={i} className="uds-social-proof__logo" src={logo.src} alt={logo.alt} />
            ))}
          </div>
        )}
        {stats && stats.length > 0 && (
          <div className="uds-social-proof__stats">
            {stats.map((stat, i) => (
              <div key={i} className="uds-social-proof__stat">
                <span className="uds-social-proof__stat-value">{stat.value}</span>
                <span className="uds-social-proof__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
        {testimonials && testimonials.length > 0 && (
          <div className="uds-social-proof__testimonials">
            {testimonials.map((t, i) => (
              <div key={i} className="uds-social-proof__testimonial">
                <p className="uds-social-proof__quote">{t.quote}</p>
                <cite className="uds-social-proof__cite">{t.name}{t.title && `, ${t.title}`}</cite>
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
    );
  }
);

SocialProof.displayName = 'SocialProof';
