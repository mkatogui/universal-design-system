import React from 'react';

export interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open = false,
  onOpenChange,
  trigger,
  children,
  className,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  const id = React.useId();
  const contentId = `${id}-content`;
  const classes = ['uds-collapsible', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!isOpen)}
        className="uds-collapsible__trigger"
      >
        {trigger}
      </button>
      <section
        id={contentId}
        className="uds-collapsible__content"
        hidden={!isOpen}
        aria-hidden={!isOpen}
      >
        {children}
      </section>
    </div>
  );
};

Collapsible.displayName = 'Collapsible';
