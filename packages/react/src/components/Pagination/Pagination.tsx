import React, { useCallback } from 'react';

/**
 * Props for the {@link Pagination} component.
 *
 * Extends native `<nav>` attributes.
 */
export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** Navigation style. @default 'numbered' */
  variant?: 'numbered' | 'simple' | 'load-more' | 'infinite-scroll';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md';
  /** The currently-active page (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called with the new page number when the user navigates. */
  onPageChange: (page: number) => void;
}

/**
 * A pagination control for navigating through paged data.
 *
 * Supports numbered pages with ellipsis truncation, simple prev/next,
 * and "load more" button variants. Renders a `<nav>` with
 * `aria-label="Pagination"` and `aria-current="page"` on the active page.
 *
 * Uses BEM class `uds-pagination` with variant and size modifiers.
 * Forwards its ref to the root `<nav>` element.
 *
 * @example
 * ```tsx
 * <Pagination currentPage={3} totalPages={10} onPageChange={setPage} />
 * ```
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      variant = 'numbered',
      size = 'md',
      currentPage,
      totalPages,
      onPageChange,
      className,
      ...props
    },
    ref,
  ) => {
    const handlePrev = useCallback(() => {
      if (currentPage > 1) onPageChange(currentPage - 1);
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
      if (currentPage < totalPages) onPageChange(currentPage + 1);
    }, [currentPage, totalPages, onPageChange]);

    const classes = [
      'uds-pagination',
      `uds-pagination--${variant}`,
      `uds-pagination--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (variant === 'load-more') {
      return (
        <nav ref={ref} className={classes} aria-label="Pagination" {...props}>
          <button
            className="uds-pagination__load-more"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            type="button"
          >
            Load more
          </button>
        </nav>
      );
    }

    if (variant === 'simple') {
      return (
        <nav ref={ref} className={classes} aria-label="Pagination" {...props}>
          <button
            className="uds-pagination__prev"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            type="button"
          >
            Previous
          </button>
          <span className="uds-pagination__info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="uds-pagination__next"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            type="button"
          >
            Next
          </button>
        </nav>
      );
    }

    const getPageNumbers = (): (number | '...')[] => {
      const pages: (number | '...')[] = [];
      const delta = 1;
      const left = Math.max(2, currentPage - delta);
      const right = Math.min(totalPages - 1, currentPage + delta);

      pages.push(1);
      if (left > 2) pages.push('...');
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
      return pages;
    };

    return (
      <nav ref={ref} className={classes} aria-label="Pagination" {...props}>
        <button
          className="uds-pagination__prev"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          type="button"
        >
          Previous
        </button>
        <ol className="uds-pagination__list">
          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <li key={`ellipsis-${i}`} className="uds-pagination__ellipsis" aria-hidden="true">
                ...
              </li>
            ) : (
              <li key={page}>
                <button
                  className={[
                    'uds-pagination__page',
                    page === currentPage && 'uds-pagination__page--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                  type="button"
                >
                  {page}
                </button>
              </li>
            ),
          )}
        </ol>
        <button
          className="uds-pagination__next"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          type="button"
        >
          Next
        </button>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
