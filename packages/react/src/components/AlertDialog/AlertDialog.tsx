import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDialogOverlay } from '../../utils/useDialogOverlay';

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
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    useDialogOverlay(open, onClose, dialogRef);

    // Auto-focus the cancel button (least-destructive action)
    React.useEffect(() => {
      if (open) {
        requestAnimationFrame(() => {
          cancelRef.current?.focus();
        });
      }
    }, [open]);

    if (!open) return null;

    const classes = ['uds-alert-dialog', `uds-alert-dialog--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    const titleId = 'uds-alert-dialog-title';
    const descId = 'uds-alert-dialog-desc';

    return createPortal(
      <div className="uds-alert-dialog-overlay">
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
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
