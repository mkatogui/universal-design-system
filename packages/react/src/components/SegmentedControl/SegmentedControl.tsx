import type React from 'react';
import { useCallback, useRef, useState } from 'react';

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  /** Options to display. */
  options: SegmentedControlOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Callback when selection changes. */
  onChange?: (value: string) => void;
  /** Size of the control. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Show only icons (labels hidden). @default false */
  iconOnly?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Additional CSS class for the root. */
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  iconOnly = false,
  disabled = false,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '');
  const value = controlledValue ?? internalValue;
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (disabled) return;
      if (controlledValue === undefined) setInternalValue(optionValue);
      onChange?.(optionValue);
    },
    [disabled, controlledValue, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      if (disabled) return;
      let nextIndex = currentIndex;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = Math.min(options.length - 1, currentIndex + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = options.length - 1;
      } else return;
      const nextValue = options[nextIndex]?.value;
      if (nextValue != null) {
        handleSelect(nextValue);
        requestAnimationFrame(() => buttonRefs.current[nextIndex]?.focus());
      }
    },
    [disabled, options, handleSelect],
  );

  const classes = [
    'uds-segmented-control',
    `uds-segmented-control--${size}`,
    iconOnly && 'uds-segmented-control--icon-only',
    disabled && 'uds-segmented-control--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="radiogroup" aria-label="Options" aria-disabled={disabled}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <React.Fragment key={option.value}>
            {/* biome-ignore lint/a11y/useSemanticElements: segmented control uses role=radio per ARIA */}
            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={[
                'uds-segmented-control__option',
                isSelected && 'uds-segmented-control__option--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {option.icon && (
                <span className="uds-segmented-control__icon" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              {!iconOnly && <span className="uds-segmented-control__label">{option.label}</span>}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

SegmentedControl.displayName = 'SegmentedControl';
