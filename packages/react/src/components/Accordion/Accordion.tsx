import React, { useState, useCallback, useId } from 'react';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'single' | 'multi' | 'flush';
  items: AccordionItem[];
  defaultExpanded?: number[];
  allowMultiple?: boolean;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ variant = 'single', items, defaultExpanded = [], allowMultiple = false, className, ...props }, ref) => {
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
      [allowMultiple]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, index: number) => {
        const enabledIndices = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
        const currentPos = enabledIndices.indexOf(index);
        let targetIndex: number | undefined;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = enabledIndices[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = enabledIndices[enabledIndices.length - 1];
        }

        if (targetIndex !== undefined) {
          const btn = document.getElementById(`${baseId}-trigger-${targetIndex}`);
          btn?.focus();
        }
      },
      [items, baseId]
    );

    const classes = [
      'uds-accordion',
      `uds-accordion--${variant}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {items.map((item, index) => {
          const isExpanded = expanded.has(index);
          return (
            <div key={index} className={['uds-accordion__item', isExpanded && 'uds-accordion__item--expanded'].filter(Boolean).join(' ')}>
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
              <div
                id={`${baseId}-panel-${index}`}
                className="uds-accordion__panel"
                role="region"
                aria-labelledby={`${baseId}-trigger-${index}`}
                hidden={!isExpanded}
              >
                <div className="uds-accordion__content">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
