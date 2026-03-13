import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface AlertDialogProps {
  /** Whether the alert dialog is currently visible. */
  open: boolean;
  /** Callback fired when the dialog should close. */
  onClose: () => void;
  /** Callback fired when the confirm action is triggered. */
  onConfirm: () => void;
  /** Visual variant indicating severity. @default 'info' */
  variant?: 'info' | 'warning' | 'destructive';
  /** Dialog heading. */
  title: string;
  /** Descriptive message explaining the action. */
  description: string;
  /** Label for the confirm button. @default 'Confirm' */
  confirmLabel?: string;
  /** Label for the cancel button. @default 'Cancel' */
  cancelLabel?: string;
  /** Additional CSS class for the dialog panel. */
  className?: string;
}

export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      open,
      onClose,
      onConfirm,
      variant = 'info',
      title,
      description,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      className,
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key === 'Tab' && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      [onClose],
    );

    useEffect(() => {
      if (open) {
        previousFocus.current = document.activeElement as HTMLElement;
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          cancelRef.current?.focus();
        });
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocus.current?.focus();
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const classes = ['uds-alert-dialog', `uds-alert-dialog--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    const titleId = 'uds-alert-dialog-title';
    const descId = 'uds-alert-dialog-desc';

    return createPortal(
      <div className="uds-alert-dialog-overlay" role="presentation">
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={classes}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <div className="uds-alert-dialog__header">
            <h2 id={titleId} className="uds-alert-dialog__title">
              {title}
            </h2>
          </div>
          <div className="uds-alert-dialog__body">
            <p id={descId} className="uds-alert-dialog__description">
              {description}
            </p>
          </div>
          <div className="uds-alert-dialog__footer">
            <button
              ref={cancelRef}
              className="uds-btn uds-btn--secondary uds-btn--md"
              onClick={onClose}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              className={`uds-btn uds-btn--${variant === 'destructive' ? 'destructive' : 'primary'} uds-btn--md`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);

AlertDialog.displayName = 'AlertDialog';
