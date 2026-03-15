import React from 'react';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, min = 0, max = 100, step = 1, size = 'md', className, onChange, ...props }, ref) => {
    const classes = ['uds-slider', `uds-slider--${size}`, className].filter(Boolean).join(' ');
    const val = value ?? min;
    return (
      <div className={classes}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={onChange}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          className="uds-slider__input"
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = 'Slider';
