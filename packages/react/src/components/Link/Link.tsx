import React from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Visual variant. @default 'primary' */
  variant?: 'default' | 'muted' | 'primary';
  /** When true, adds rel and target for external links. */
  external?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = 'primary', external, href, className, children, ...props }, ref) => {
    const classes = ['uds-link', `uds-link--${variant}`, className].filter(Boolean).join(' ');
    const rel = external ? 'noopener noreferrer' : undefined;
    const target = external ? '_blank' : undefined;
    return (
      <a ref={ref} href={href} className={classes} rel={rel} target={target} {...props}>
        {children}
      </a>
    );
  },
);

Link.displayName = 'Link';
