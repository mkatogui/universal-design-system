import type React from 'react';

export interface ToolbarProps {
  /** Toolbar content (buttons, dropdowns, etc.). */
  children: React.ReactNode;
  /** Layout direction. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible label for the toolbar (required for screen readers). */
  'aria-label': string;
  /** Additional CSS class for the root. */
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  children,
  orientation = 'horizontal',
  'aria-label': ariaLabel,
  className,
}) => {
  const classes = ['uds-toolbar', orientation === 'vertical' && 'uds-toolbar--vertical', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="toolbar" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

Toolbar.displayName = 'Toolbar';
