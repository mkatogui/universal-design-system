import type React from 'react';
import { useCallback, useRef, useState } from 'react';

export interface ChipInputProps {
  /** Current chip values (controlled). */
  value?: string[];
  /** Initial values when uncontrolled. */
  defaultValue?: string[];
  /** Callback when chips change. */
  onChange?: (chips: string[]) => void;
  /** Callback when a chip is added (e.g. on Enter). */
  onAdd?: (chip: string) => void;
  /** Callback when a chip is removed. */
  onRemove?: (index: number) => void;
  /** Maximum number of chips. */
  maxChips?: number;
  /** Placeholder for the input. @default 'Add...' */
  placeholder?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Additional props for the inner input. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Additional CSS class for the root. */
  className?: string;
}

export const ChipInput: React.FC<ChipInputProps> = ({
  value: controlledValue,
  defaultValue = [],
  onChange,
  onAdd,
  onRemove,
  maxChips,
  placeholder = 'Add...',
  disabled = false,
  inputProps,
  className,
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const chips = controlledValue ?? internalValue;

  const updateChips = useCallback(
    (next: string[]) => {
      if (controlledValue === undefined) setInternalValue(next);
      onChange?.(next);
    },
    [controlledValue, onChange],
  );

  const handleAdd = useCallback(
    (chip: string) => {
      const trimmed = chip.trim();
      if (!trimmed || (maxChips != null && chips.length >= maxChips)) return;
      if (chips.includes(trimmed)) return;
      const next = [...chips, trimmed];
      updateChips(next);
      onAdd?.(trimmed);
      setInputValue('');
    },
    [chips, maxChips, updateChips, onAdd],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = chips.filter((_, i) => i !== index);
      updateChips(next);
      onRemove?.(index);
      inputRef.current?.focus();
    },
    [chips, updateChips, onRemove],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd(inputValue);
      }
      if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
        handleRemove(chips.length - 1);
      }
      inputProps?.onKeyDown?.(e);
    },
    [inputValue, chips.length, handleAdd, handleRemove, inputProps],
  );

  const classes = ['uds-chip-input', disabled && 'uds-chip-input--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="listbox"
      tabIndex={0}
      aria-label="Chips"
      aria-disabled={disabled}
      onClick={() => inputRef.current?.focus()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      {chips.map((chip) => (
        <span
          key={chip}
          className="uds-chip-input__chip"
          role="option"
          aria-selected={true}
          tabIndex={-1}
        >
          <span className="uds-chip-input__chip-label">{chip}</span>
          <button
            type="button"
            className="uds-chip-input__chip-remove"
            aria-label={`Remove ${chip}`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(chips.indexOf(chip));
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {(maxChips == null || chips.length < maxChips) && (
        <input
          ref={inputRef}
          type="text"
          className="uds-chip-input__input"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Add chip"
          {...inputProps}
        />
      )}
    </div>
  );
};

ChipInput.displayName = 'ChipInput';
