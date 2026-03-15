import React from 'react';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'outlined' | 'removable';
  size?: 'sm' | 'md';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onRemove,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const classes = [
    'uds-chip',
    `uds-chip--${variant}`,
    `uds-chip--${size}`,
    onRemove && 'uds-chip--removable',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} role="listitem">
      <span className="uds-chip__label">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="uds-chip__remove"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </span>
  );
};

Chip.displayName = 'Chip';
