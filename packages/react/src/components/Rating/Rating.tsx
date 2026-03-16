import type React from 'react';

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
    <fieldset className={classes} style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend
        className="uds-rating__legend"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      >{`Rating ${value} of ${max}`}</legend>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        return (
          <button
            key={starValue}
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
    </fieldset>
  );
};

Rating.displayName = 'Rating';
