import React, { useCallback, useId, useRef, useState } from 'react';

/**
 * Props for the {@link Tooltip} component.
 */
export interface TooltipProps {
  /** Content complexity. @default 'simple' */
  variant?: 'simple' | 'rich';
  /** Controls padding and max-width. @default 'sm' */
  size?: 'sm' | 'md';
  /** Content rendered inside the tooltip bubble. */
  content: React.ReactNode;
  /** Preferred tooltip placement relative to the trigger. @default 'top' */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** The single child element that triggers the tooltip on hover/focus. */
  children: React.ReactElement;
  /** Additional CSS class for the wrapper. */
  className?: string;
}

/**
 * An accessible tooltip that appears on hover and focus.
 *
 * Clones the child element to inject `aria-describedby` pointing
 * at the tooltip content. Uses `role="tooltip"` on the popover
 * and `aria-hidden` to toggle visibility for assistive tech.
 *
 * Uses BEM class `uds-tooltip` with variant, size, and position modifiers.
 *
 * @example
 * ```tsx
 * <Tooltip content="Copy to clipboard">
 *   <button>Copy</button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  variant = 'simple',
  size = 'sm',
  content,
  position = 'top',
  children,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }, []);

  const classes = [
    'uds-tooltip',
    `uds-tooltip--${variant}`,
    `uds-tooltip--${size}`,
    `uds-tooltip--${position}`,
    visible && 'uds-tooltip--visible',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.cloneElement(children, {
        'aria-describedby': tooltipId,
      })}
      <div id={tooltipId} className="uds-tooltip__content" role="tooltip" aria-hidden={!visible}>
        {content}
      </div>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
