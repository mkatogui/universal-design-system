import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDialogOverlay } from '../../utils/useDialogOverlay';

export interface DrawerProps {
  /** Whether the drawer is currently visible. */
  open: boolean;
  /** Callback fired when the drawer should close. */
  onClose: () => void;
  /** Edge from which the drawer slides in. @default 'right' */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Width (left/right) or height (top/bottom) of the drawer. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Dialog heading rendered in the header. */
  title?: string;
  /** Body content of the drawer. */
  children: React.ReactNode;
  /** Additional CSS class for the drawer panel. */
  className?: string;
}

export const Drawer = React.forwardRef<HTMLDialogElement, DrawerProps>(
  ({ open, onClose, side = 'right', size = 'md', title, children, className }, ref) => {
    const drawerRef = useRef<HTMLDialogElement | null>(null);

    useDialogOverlay(open, onClose, drawerRef);

    // Click on overlay (outside dialog) to close
    useEffect(() => {
      if (!open) return;
      const handleOverlayClick = (e: MouseEvent) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleOverlayClick);
      return () => document.removeEventListener('mousedown', handleOverlayClick);
    }, [open, onClose]);

    // Auto-focus the first focusable element when opened
    React.useEffect(() => {
      if (open) {
        requestAnimationFrame(() => {
          const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable && focusable.length > 0) {
            focusable[0].focus();
          }
        });
      }
    }, [open]);

    if (!open) return null;
    if (typeof document === 'undefined') return null;

    const classes = ['uds-drawer', `uds-drawer--${side}`, `uds-drawer--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return createPortal(
      <div className="uds-drawer-overlay">
        <dialog
          ref={(node) => {
            drawerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as { current: HTMLDialogElement | null }).current = node;
          }}
          className={classes}
          open
          aria-modal="true"
          aria-label={title}
        >
          {title && (
            <div className="uds-drawer__header">
              <h2 className="uds-drawer__title">{title}</h2>
              <button
                className="uds-drawer__close"
                onClick={onClose}
                aria-label="Close drawer"
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="uds-drawer__body">{children}</div>
        </dialog>
      </div>,
      document.body,
    );
  },
);

Drawer.displayName = 'Drawer';
