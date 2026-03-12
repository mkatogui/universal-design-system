import React from 'react';

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'centered' | 'product-screenshot' | 'video-bg' | 'gradient-mesh' | 'search-forward' | 'split';
  size?: 'full' | 'compact';
  headline?: string;
  subheadline?: string;
  cta?: React.ReactNode;
  socialProof?: React.ReactNode;
  visual?: React.ReactNode;
}

export const Hero = React.forwardRef<HTMLElement, HeroProps>(
  ({ variant = 'centered', size = 'full', headline, subheadline, cta, socialProof, visual, className, children, ...props }, ref) => {
    const classes = [
      'uds-hero',
      `uds-hero--${variant}`,
      `uds-hero--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <section ref={ref} className={classes} {...props}>
        <div className="uds-hero__content">
          {headline && <h1 className="uds-hero__headline">{headline}</h1>}
          {subheadline && <p className="uds-hero__subheadline">{subheadline}</p>}
          {cta && <div className="uds-hero__cta">{cta}</div>}
          {socialProof && <div className="uds-hero__social-proof">{socialProof}</div>}
        </div>
        {visual && <div className="uds-hero__visual">{visual}</div>}
        {children}
      </section>
    );
  }
);

Hero.displayName = 'Hero';
