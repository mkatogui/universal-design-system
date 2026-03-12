import React from 'react';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'simple' | 'multi-column' | 'newsletter' | 'mega-footer';
  size?: 'standard' | 'compact';
  columns?: FooterColumn[];
  newsletter?: React.ReactNode;
  legal?: React.ReactNode;
  copyright?: string;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ variant = 'simple', size = 'standard', columns, newsletter, legal, copyright, className, children, ...props }, ref) => {
    const classes = [
      'uds-footer',
      `uds-footer--${variant}`,
      `uds-footer--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <footer ref={ref} className={classes} aria-label="Site footer" {...props}>
        {columns && columns.length > 0 && (
          <div className="uds-footer__columns">
            {columns.map((col, i) => (
              <div key={i} className="uds-footer__column">
                <h3 className="uds-footer__column-title">{col.title}</h3>
                <ul className="uds-footer__links">
                  {col.links.map((link, j) => (
                    <li key={j}><a href={link.href} className="uds-footer__link">{link.label}</a></li>
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
  }
);

Footer.displayName = 'Footer';
