import React from 'react';

/**
 * A single step in a {@link Breadcrumb} trail.
 */
export interface BreadcrumbItem {
  /** Visible text for this breadcrumb step. */
  label: string;
  /** Link URL. If omitted (or on the last item), rendered as plain text. */
  href?: string;
}

/**
 * Props for the {@link Breadcrumb} component.
 *
 * Extends native `<nav>` attributes.
 */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of breadcrumb steps from root to current page. */
  items: BreadcrumbItem[];
  /** Separator between items. @default '/' */
  separator?: React.ReactNode;
  /** When set, truncates the trail with an ellipsis if items exceed this count. */
  maxItems?: number;
}

/**
 * A breadcrumb navigation trail showing the user's location within the
 * site hierarchy.
 *
 * Renders a `<nav>` with `aria-label="Breadcrumb"` and an `<ol>` list.
 * The last item receives `aria-current="page"`. When `maxItems` is set
 * and exceeded, middle items are collapsed into an ellipsis.
 *
 * Uses BEM class `uds-breadcrumb`.
 * Forwards its ref to the root `<nav>` element.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Docs', href: '/docs' },
 *   { label: 'Components' },
 * ]} />
 * ```
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', maxItems, className, ...props }, ref) => {
    const classes = ['uds-breadcrumb', className].filter(Boolean).join(' ');

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
              <li key={item.href ?? item.label} className="uds-breadcrumb__item">
                {item.href && !isLast ? (
                  <a className="uds-breadcrumb__link" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span className="uds-breadcrumb__text" aria-current={isLast ? 'page' : undefined}>
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
  },
);

Breadcrumb.displayName = 'Breadcrumb';
