import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDialogOverlay } from '../../utils/useDialogOverlay';

/**
 * Props for the {@link Modal} component.
 */
export interface ModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Callback fired when the modal should close (Escape key, overlay click, close button). */
  onClose: () => void;
  /** Purpose-specific visual variant. @default 'task' */
  variant?: 'confirmation' | 'task' | 'alert';
  /** Width constraint of the dialog panel. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Dialog heading rendered in the header; also used as `aria-label`. */
  title?: string;
  /** Body content of the dialog. */
  children: React.ReactNode;
  /** Action buttons rendered in the footer area. */
  actions?: React.ReactNode;
  /** Additional CSS class for the dialog panel. */
  className?: string;
}

/**
 * An accessible modal dialog rendered via React Portal into `document.body`.
 *
 * Features:
 * - Focus trap (Tab / Shift+Tab cycles within the dialog)
 * - Escape key closes the dialog
 * - Clicking the overlay backdrop closes the dialog
 * - Restores focus to the previously-focused element on close
 * - Sets `aria-modal="true"` and `role="dialog"`
 * - Locks body scroll while open
 *
 * Uses BEM class `uds-modal` with variant and size modifiers.
 * Forwards its ref to the dialog panel `<div>`.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm">
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, variant = 'task', size = 'md', title, children, actions, className }, ref) => {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useDialogOverlay(open, onClose, modalRef);

    // Auto-focus the first focusable element when opened
    React.useEffect(() => {
      if (open) {
        requestAnimationFrame(() => {
          const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable && focusable.length > 0) {
            focusable[0].focus();
          }
        });
      }
    }, [open]);

    if (!open) return null;

    const classes = ['uds-modal', `uds-modal--${variant}`, `uds-modal--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return createPortal(
      <div
        className="uds-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={(node) => {
            modalRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
          }}
          className={classes}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {title && (
            <div className="uds-modal__header">
              <h2 className="uds-modal__title">{title}</h2>
              <button
                className="uds-modal__close"
                onClick={onClose}
                aria-label="Close dialog"
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
          <div className="uds-modal__body">{children}</div>
          {actions && <div className="uds-modal__footer">{actions}</div>}
        </div>
      </div>,
      document.body,
    );
  },
);

Modal.displayName = 'Modal';
