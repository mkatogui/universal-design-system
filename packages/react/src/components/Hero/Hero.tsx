import React from 'react';

/**
 * Props for the {@link Hero} component.
 *
 * Extends native `<section>` attributes.
 */
export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout variant for the hero section. @default 'centered' */
  variant?:
    | 'centered'
    | 'product-screenshot'
    | 'video-bg'
    | 'gradient-mesh'
    | 'search-forward'
    | 'split';
  /** Height mode. @default 'full' */
  size?: 'full' | 'compact';
  /** Primary heading text (`<h1>`). */
  headline?: string;
  /** Supporting text below the headline. */
  subheadline?: string;
  /** Call-to-action element (usually a Button or button group). */
  cta?: React.ReactNode;
  /** Social proof element (logos, stats, mini-testimonials). */
  socialProof?: React.ReactNode;
  /** Visual element (screenshot, video, illustration) for split layouts. */
  visual?: React.ReactNode;
}

/**
 * A full-width hero section for landing pages with headline, sub-headline,
 * CTA, social proof, and an optional visual column.
 *
 * Renders a `<section>` element. Uses BEM class `uds-hero` with variant
 * and size modifiers. Forwards its ref to the root `<section>`.
 *
 * @example
 * ```tsx
 * <Hero
 *   variant="split"
 *   headline="Ship faster"
 *   subheadline="Design system for modern teams"
 *   cta={<Button>Get started</Button>}
 *   visual={<img src="/screenshot.png" alt="Product" />}
 * />
 * ```
 */
export const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      variant = 'centered',
      size = 'full',
      headline,
      subheadline,
      cta,
      socialProof,
      visual,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = ['uds-hero', `uds-hero--${variant}`, `uds-hero--${size}`, className]
      .filter(Boolean)
      .join(' ');

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
  },
);

Hero.displayName = 'Hero';
