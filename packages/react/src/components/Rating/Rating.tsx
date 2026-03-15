import React from 'react';

export interface RatingProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  max = 5,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const classes = ['uds-rating', `uds-rating--${size}`, className].filter(Boolean).join(' ');
  return (
    <div
      className={classes}
      role="group"
      aria-label={`Rating ${value} of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        return (
          <button
            key={i}
            type="button"
            className={`uds-rating__star ${filled ? 'uds-rating__star--filled' : ''}`}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            disabled={disabled}
            onClick={() => onChange?.(starValue)}
          >
            <span aria-hidden="true">{filled ? '★' : '☆'}</span>
          </button>
        );
      })}
    </div>
  );
};

Rating.displayName = 'Rating';
