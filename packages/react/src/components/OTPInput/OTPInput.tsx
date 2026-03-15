import React, { useCallback, useRef, useState } from 'react';

export interface OTPInputProps {
  /** Number of digits. @default 4 */
  length?: 4 | 6;
  /** Current value (controlled). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Callback when value changes. */
  onChange?: (value: string) => void;
  /** Auto-focus first input on mount. @default false */
  autoFocus?: boolean;
  /** Input mode for the fields. @default 'numeric' */
  inputMode?: 'numeric' | 'text';
  /** Disabled state. */
  disabled?: boolean;
  /** Additional CSS class for the root. */
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value: controlledValue,
  defaultValue = '',
  onChange,
  autoFocus = false,
  inputMode = 'numeric',
  disabled = false,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue.slice(0, length));
  const value = (controlledValue ?? internalValue).slice(0, length).padEnd(length, '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setValue = useCallback(
    (next: string) => {
      const s = next.slice(0, length);
      if (controlledValue === undefined) setInternalValue(s);
      onChange?.(s);
    },
    [length, controlledValue, onChange],
  );

  const handleChange = useCallback(
    (index: number, digit: string) => {
      const char = inputMode === 'numeric' ? digit.replace(/\D/g, '').slice(-1) : digit.slice(-1);
      const arr = value.split('');
      arr[index] = char;
      const next = arr.join('');
      setValue(next);
      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, length, inputMode, setValue],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && value[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, length],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
      if (inputMode === 'numeric' && pasted) {
        setValue(pasted);
        const nextIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    },
    [length, inputMode, setValue],
  );

  const classes = ['uds-otp-input', disabled && 'uds-otp-input--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="group"
      aria-label="One-time code"
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode={inputMode}
          maxLength={1}
          autoComplete="one-time-code"
          className="uds-otp-input__digit"
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </div>
  );
};

OTPInput.displayName = 'OTPInput';
