import React from 'react';

export interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  showHexInput?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  label,
  showHexInput = true,
  disabled = false,
  className,
}) => {
  const classes = ['uds-color-picker', className].filter(Boolean).join(' ');
  const id = React.useId();
  return (
    <div className={classes}>
      {label && (
        <label htmlFor={id} className="uds-color-picker__label">
          {label}
        </label>
      )}
      <div className="uds-color-picker__row">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="uds-color-picker__swatch"
          aria-describedby={showHexInput ? `${id}-hex` : undefined}
        />
        {showHexInput && (
          <input
            id={`${id}-hex`}
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="uds-color-picker__hex"
            aria-label="Hex color"
          />
        )}
      </div>
    </div>
  );
};

ColorPicker.displayName = 'ColorPicker';
