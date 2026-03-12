import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', maxItems, className, ...props }, ref) => {
    const classes = [
      'uds-breadcrumb',
      className,
    ].filter(Boolean).join(' ');

    let displayItems = items;
    const truncated = maxItems && items.length > maxItems;

    if (truncated && maxItems) {
      const head = items.slice(0, 1);
      const tail = items.slice(-(maxItems - 1));
      displayItems = [...head, { label: '...' }, ...tail];
    }

    return (
      <nav ref={ref} className={classes} aria-label="Breadcrumb" {...props}>
        <ol className="uds-breadcrumb__list">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            return (
              <li key={index} className="uds-breadcrumb__item">
                {item.href && !isLast ? (
                  <a className="uds-breadcrumb__link" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span
                    className="uds-breadcrumb__text"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className="uds-breadcrumb__separator" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
