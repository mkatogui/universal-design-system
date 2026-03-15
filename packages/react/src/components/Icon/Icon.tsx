import React from 'react';

export interface IconProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  children?: React.ReactNode;
  className?: string;
  /** When true, sets aria-hidden (decorative). @default true */
  decorative?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  children,
  className,
  decorative = true,
}) => {
  const classes = ['uds-icon', `uds-icon--${size}`, className].filter(Boolean).join(' ');
  const style: React.CSSProperties = color ? { color } : {};
  return (
    <span
      className={classes}
      style={style}
      aria-hidden={decorative}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
    >
      {children ?? (name && <span className="uds-icon__symbol">{name}</span>)}
    </span>
  );
};

Icon.displayName = 'Icon';
