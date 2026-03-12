import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'bar' | 'circular' | 'stepper';
  size?: 'sm' | 'md' | 'lg';
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ variant = 'bar', size = 'md', value = 0, max = 100, label, showValue, indeterminate, className, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const classes = [
      'uds-progress',
      `uds-progress--${variant}`,
      `uds-progress--${size}`,
      indeterminate && 'uds-progress--indeterminate',
      className,
    ].filter(Boolean).join(' ');

    if (variant === 'circular') {
      const radius = size === 'sm' ? 16 : size === 'lg' ? 28 : 22;
      const circumference = 2 * Math.PI * radius;
      const offset = indeterminate ? 0 : circumference - (percentage / 100) * circumference;
      const svgSize = (radius + 4) * 2;

      return (
        <div
          ref={ref}
          className={classes}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <svg className="uds-progress__svg" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            <circle
              className="uds-progress__track"
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              strokeWidth="4"
            />
            <circle
              className="uds-progress__fill"
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {showValue && !indeterminate && (
            <span className="uds-progress__value">{Math.round(percentage)}%</span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={classes}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        {...props}
      >
        {label && <span className="uds-progress__label">{label}</span>}
        <div className="uds-progress__track">
          <div
            className="uds-progress__fill"
            style={indeterminate ? undefined : { width: `${percentage}%` }}
          />
        </div>
        {showValue && !indeterminate && (
          <span className="uds-progress__value">{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
