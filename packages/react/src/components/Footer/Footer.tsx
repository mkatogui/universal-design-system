import React from 'react';

/**
 * Describes a single link column displayed in the {@link Footer} grid.
 */
export interface FooterColumn {
  /** Column heading. */
  title: string;
  /** Links rendered under this column. */
  links: { label: string; href: string }[];
}

/**
 * Props for the {@link Footer} component.
 *
 * Extends native `<footer>` attributes.
 */
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout variant. @default 'simple' */
  variant?: 'simple' | 'multi-column' | 'newsletter' | 'mega-footer';
  /** Density. @default 'standard' */
  size?: 'standard' | 'compact';
  /** Array of link columns to render. */
  columns?: FooterColumn[];
  /** Newsletter subscription form element. */
  newsletter?: React.ReactNode;
  /** Legal/fine-print content. */
  legal?: React.ReactNode;
  /** Copyright text rendered at the very bottom. */
  copyright?: string;
}

/**
 * A site footer with optional multi-column link grid, newsletter form,
 * legal section, and copyright notice.
 *
 * Renders a `<footer>` with `aria-label="Site footer"`.
 * Uses BEM class `uds-footer` with variant and size modifiers.
 * Forwards its ref to the root `<footer>` element.
 *
 * @example
 * ```tsx
 * <Footer
 *   variant="multi-column"
 *   columns={[{ title: 'Product', links: [{ label: 'Features', href: '/features' }] }]}
 *   copyright="2024 Acme Inc."
 * />
 * ```
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      variant = 'simple',
      size = 'standard',
      columns,
      newsletter,
      legal,
      copyright,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = ['uds-footer', `uds-footer--${variant}`, `uds-footer--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <footer ref={ref} className={classes} aria-label="Site footer" {...props}>
        {columns && columns.length > 0 && (
          <div className="uds-footer__columns">
            {columns.map((col) => (
              <div key={col.title} className="uds-footer__column">
                <h3 className="uds-footer__column-title">{col.title}</h3>
                <ul className="uds-footer__links">
                  {col.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <a href={link.href} className="uds-footer__link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {newsletter && <div className="uds-footer__newsletter">{newsletter}</div>}
        {children}
        {legal && <div className="uds-footer__legal">{legal}</div>}
        {copyright && <p className="uds-footer__copyright">{copyright}</p>}
      </footer>
    );
  },
);

Footer.displayName = 'Footer';
