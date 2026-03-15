import React from 'react';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  value?: number | string;
  min?: number;
  max?: number;
  step?: number;
  /** Show stepper buttons. @default false */
  showStepper?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      min,
      max,
      step = 1,
      showStepper = false,
      size = 'md',
      className,
      disabled,
      onChange,
      ...props
    },
    ref,
  ) => {
    const numValue = value === undefined || value === '' ? '' : Number(value);
    const classes = [
      'uds-number-input',
      `uds-number-input--${size}`,
      showStepper && 'uds-number-input--stepper',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleStep = (delta: number) => {
      const next = (Number(numValue) || 0) + delta;
      const clamped = min != null && next < min ? min : max != null && next > max ? max : next;
      onChange?.({
        target: { value: String(clamped) },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div className={classes}>
        {showStepper && (
          <button
            type="button"
            className="uds-number-input__stepper uds-number-input__stepper--minus"
            aria-label="Decrease"
            disabled={disabled || (min != null && Number(numValue) <= min)}
            onClick={() => handleStep(-step)}
          >
            −
          </button>
        )}
        <input
          ref={ref}
          type="number"
          value={numValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={onChange}
          aria-valuenow={numValue !== '' ? Number(numValue) : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          className="uds-number-input__input"
          {...props}
        />
        {showStepper && (
          <button
            type="button"
            className="uds-number-input__stepper uds-number-input__stepper--plus"
            aria-label="Increase"
            disabled={disabled || (max != null && Number(numValue) >= max)}
            onClick={() => handleStep(step)}
          >
            +
          </button>
        )}
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';
