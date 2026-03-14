import React, { useCallback, useId, useState } from 'react';

/**
 * Describes a single collapsible section inside an {@link Accordion}.
 */
export interface AccordionItem {
  /** Heading text shown on the trigger button. */
  title: string;
  /** Content revealed when the section is expanded. */
  content: React.ReactNode;
  /** Prevent this section from being toggled. */
  disabled?: boolean;
}

/**
 * Props for the {@link Accordion} component.
 *
 * Extends native `<div>` attributes.
 */
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant. @default 'single' */
  variant?: 'single' | 'multi' | 'flush';
  /** Array of collapsible sections. */
  items: AccordionItem[];
  /** Indices of sections that are expanded on mount. @default [] */
  defaultExpanded?: number[];
  /** Allow multiple sections to be open simultaneously. @default false */
  allowMultiple?: boolean;
}

/**
 * An accessible accordion following the WAI-ARIA Accordion pattern.
 *
 * Features:
 * - `aria-expanded` / `aria-controls` on trigger buttons
 * - `role="region"` with `aria-labelledby` on panels
 * - Arrow-key (Up/Down), Home, and End keyboard navigation between headers
 *
 * Uses BEM class `uds-accordion` with variant modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <Accordion items={[
 *   { title: 'FAQ 1', content: <p>Answer 1</p> },
 *   { title: 'FAQ 2', content: <p>Answer 2</p> },
 * ]} />
 * ```
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    { variant = 'single', items, defaultExpanded = [], allowMultiple = false, className, ...props },
    ref,
  ) => {
    const [expanded, setExpanded] = useState<Set<number>>(new Set(defaultExpanded));
    const baseId = useId();

    const toggle = useCallback(
      (index: number) => {
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            if (!allowMultiple) next.clear();
            next.add(index);
          }
          return next;
        });
      },
      [allowMultiple],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, index: number) => {
        const enabledIndices = items
          .map((item, i) => (item.disabled ? -1 : i))
          .filter((i) => i >= 0);
        const currentPos = enabledIndices.indexOf(index);
        let targetIndex: number | undefined;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex =
            enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = enabledIndices[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = enabledIndices.at(-1);
        }

        if (targetIndex !== undefined) {
          const btn = document.getElementById(`${baseId}-trigger-${targetIndex}`);
          btn?.focus();
        }
      },
      [items, baseId],
    );

    const classes = ['uds-accordion', `uds-accordion--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {items.map((item, index) => {
          const isExpanded = expanded.has(index);
          return (
            <div
              key={item.title}
              className={['uds-accordion__item', isExpanded && 'uds-accordion__item--expanded']
                .filter(Boolean)
                .join(' ')}
            >
              <h3 className="uds-accordion__header">
                <button
                  id={`${baseId}-trigger-${index}`}
                  className="uds-accordion__trigger"
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`${baseId}-panel-${index}`}
                  disabled={item.disabled}
                  onClick={() => toggle(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  {item.title}
                  <span className="uds-accordion__icon" aria-hidden="true" />
                </button>
              </h3>
              <section
                id={`${baseId}-panel-${index}`}
                className="uds-accordion__panel"
                aria-labelledby={`${baseId}-trigger-${index}`}
                hidden={!isExpanded}
              >
                <div className="uds-accordion__content">{item.content}</div>
              </section>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
