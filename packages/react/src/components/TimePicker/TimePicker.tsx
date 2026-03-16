import React from 'react';

export interface TimePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'onChange' | 'size'
  > {
  value?: string;
  /** HH:mm format. */
  onChange?: (value: string) => void;
  size?: 'md' | 'lg';
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ value = '', size = 'md', className, onChange, ...props }, ref) => {
    const classes = ['uds-time-picker', `uds-time-picker--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <input
        ref={ref}
        type="time"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={classes}
        aria-label={props['aria-label'] ?? 'Time'}
        {...props}
      />
    );
  },
);

TimePicker.displayName = 'TimePicker';
