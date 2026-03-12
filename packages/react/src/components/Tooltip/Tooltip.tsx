import React, { useState, useCallback, useRef, useId } from 'react';

export interface TooltipProps {
  variant?: 'simple' | 'rich';
  size?: 'sm' | 'md';
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ variant = 'simple', size = 'sm', content, position = 'top', children, className }) => {
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
  ].filter(Boolean).join(' ');

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
