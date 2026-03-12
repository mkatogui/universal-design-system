import React, { useState, useRef, useCallback, useId } from 'react';

/**
 * Describes a single tab and its associated panel content.
 */
export interface TabItem {
  /** Text label shown on the tab trigger button. */
  label: string;
  /** Content rendered inside the corresponding tab panel. */
  content: React.ReactNode;
  /** When `true`, the tab cannot be selected. */
  disabled?: boolean;
}

/**
 * Props for the {@link Tabs} component.
 */
export interface TabsProps {
  /** Array of tab definitions (label + content). */
  tabs: TabItem[];
  /** Index of the initially-selected tab. @default 0 */
  defaultIndex?: number;
  /** Visual style of the tab triggers. @default 'line' */
  variant?: 'line' | 'pill' | 'segmented';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class for the root wrapper. */
  className?: string;
  /** Called with the new tab index when selection changes. */
  onChange?: (index: number) => void;
}

/**
 * An accessible tabbed interface following the WAI-ARIA Tabs pattern.
 *
 * Features:
 * - `role="tablist"` / `role="tab"` / `role="tabpanel"` structure
 * - `aria-selected`, `aria-controls`, `aria-labelledby` wiring
 * - Arrow-key (Left/Right/Up/Down), Home, and End keyboard navigation
 * - Roving `tabIndex` so only the active tab is in the tab order
 *
 * Uses BEM class `uds-tabs` with variant and size modifiers.
 *
 * @example
 * ```tsx
 * <Tabs tabs={[
 *   { label: 'Overview', content: <Overview /> },
 *   { label: 'Details',  content: <Details /> },
 * ]} />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, variant = 'line', size = 'md', className, onChange }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onChange?.(index);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const enabledIndices = tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
      const currentPos = enabledIndices.indexOf(activeIndex);
      let nextIndex: number | undefined;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = enabledIndices[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = enabledIndices[enabledIndices.length - 1];
      }

      if (nextIndex !== undefined) {
        handleSelect(nextIndex);
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [tabs, activeIndex, handleSelect]
  );

  const classes = [
    'uds-tabs',
    `uds-tabs--${variant}`,
    `uds-tabs--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="uds-tabs__list" role="tablist" aria-orientation="horizontal" onKeyDown={handleKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => { tabRefs.current[index] = el; }}
            className="uds-tabs__trigger"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={activeIndex === index}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleSelect(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          className="uds-tabs__panel"
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={activeIndex !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

Tabs.displayName = 'Tabs';
