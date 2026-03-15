import React from 'react';
import ReactDOM from 'react-dom';

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onSelect?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, onSelect, children, className }) => {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const classes = ['uds-context-menu', className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} onContextMenu={handleContextMenu}>
      {children}
      {open &&
        ReactDOM.createPortal(
          <div
            className="uds-context-menu__menu"
            role="menu"
            style={{ left: pos.x, top: pos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="uds-context-menu__item"
                disabled={item.disabled}
                onClick={() => {
                  onSelect?.(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

ContextMenu.displayName = 'ContextMenu';
