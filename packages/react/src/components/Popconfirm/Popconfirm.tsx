import React from 'react';
import ReactDOM from 'react-dom';

export interface PopconfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  children,
  open: controlledOpen,
  onOpenChange,
  className,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };
  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const classes = ['uds-popconfirm', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <div ref={anchorRef} onClick={() => setOpen(true)}>
        {children}
      </div>
      {open &&
        ReactDOM.createPortal(
          <div
            className="uds-popconfirm__panel"
            role="dialog"
            aria-describedby="uds-popconfirm-desc"
            style={{ position: 'fixed', top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="uds-popconfirm__title">{title}</p>
            {description && <p id="uds-popconfirm-desc" className="uds-popconfirm__description">{description}</p>}
            <div className="uds-popconfirm__actions">
              <button type="button" className="uds-popconfirm__cancel" onClick={handleCancel}>{cancelLabel}</button>
              <button type="button" className="uds-popconfirm__confirm" onClick={handleConfirm}>{confirmLabel}</button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

Popconfirm.displayName = 'Popconfirm';
