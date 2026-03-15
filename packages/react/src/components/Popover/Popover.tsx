import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogOverlay } from '../../utils/useDialogOverlay';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface PopoverProps {
  /** Whether the popover is open (controlled). */
  open?: boolean;
  /** Callback when open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement relative to trigger. @default 'bottom' */
  placement?: PopoverPlacement;
  /** Size of the content panel. @default 'md' */
  size?: 'sm' | 'md';
  /** The trigger element (single React element; ref and click handler are injected). */
  trigger: React.ReactElement;
  /** Content rendered inside the popover panel. */
  children: React.ReactNode;
  /** Additional CSS class for the content panel. */
  className?: string;
}

function getPlacementStyles(
  triggerRect: DOMRect,
  placement: PopoverPlacement,
  contentHeight: number,
  contentWidth: number,
): React.CSSProperties {
  const gap = 8;
  const padding = 8;
  let top = 0;
  let left = triggerRect.left;

  switch (placement) {
    case 'top':
      top = triggerRect.top - contentHeight - gap;
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
      left = triggerRect.left - contentWidth - gap;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
      left = triggerRect.right + gap;
      break;
    case 'auto': {
      const spaceBottom = window.innerHeight - triggerRect.bottom;
      const spaceTop = triggerRect.top;
      if (spaceBottom >= contentHeight + gap || spaceBottom >= spaceTop) {
        top = triggerRect.bottom + gap;
      } else {
        top = triggerRect.top - contentHeight - gap;
      }
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
      break;
    }
    default:
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
  }

  left = Math.max(padding, Math.min(window.innerWidth - contentWidth - padding, left));
  top = Math.max(padding, Math.min(window.innerHeight - contentHeight - padding, top));

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
  };
}

export const Popover: React.FC<PopoverProps> = ({
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  size = 'md',
  trigger,
  children,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) onOpenChange(value);
      else setInternalOpen(value);
    },
    [onOpenChange],
  );

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentStyle, setContentStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 9999,
  });

  useDialogOverlay(open, () => setOpen(false), contentRef);

  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setContentStyle(
        getPlacementStyles(triggerRect, placement, contentRect.height, contentRect.width),
      );
    };
    requestAnimationFrame(updatePosition);
  }, [open, placement]);

  const handleTriggerClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const triggerWithRef = React.isValidElement(trigger)
    ? React.cloneElement(trigger, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const origRef = (trigger as unknown as { ref?: React.Ref<HTMLElement> }).ref;
          if (typeof origRef === 'function') origRef(node);
          else if (origRef && typeof origRef === 'object')
            (origRef as React.MutableRefObject<HTMLElement | null>).current = node;
        },
        onClick: (e: React.MouseEvent) => {
          handleTriggerClick();
          (
            trigger as unknown as { props?: { onClick?: (e: React.MouseEvent) => void } }
          ).props?.onClick?.(e);
        },
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
      } as Record<string, unknown>)
    : trigger;

  if (!open) {
    return <>{triggerWithRef}</>;
  }

  if (typeof document === 'undefined') return <>{triggerWithRef}</>;

  const classes = ['uds-popover', `uds-popover--${size}`, `uds-popover--${placement}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {triggerWithRef}
      {createPortal(
        <div
          ref={contentRef}
          className={classes}
          role="dialog"
          aria-modal="false"
          style={contentStyle}
        >
          <div className="uds-popover__content">{children}</div>
        </div>,
        document.body,
      )}
    </>
  );
};

Popover.displayName = 'Popover';
