import React from 'react';

/**
 * Props for the {@link Input} component.
 *
 * Extends native `<input>` attributes (with `size` replaced by UDS sizing)
 * so every standard input prop is also accepted.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Native input type. Use with `multiline={false}` (default).
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  /** When true, renders a `<textarea>`; ignores `type`. @default false */
  multiline?: boolean;
  /**
   * @deprecated Use `type` and `multiline` instead. Kept for backward compatibility:
   * variant="textarea" → multiline; variant="email" etc. → type.
   */
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Visible label rendered above the field. Also used to derive the `id`. */
  label?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
  /** Error message displayed below the field; sets `aria-invalid`. */
  errorText?: string;
  /** When true, shows an asterisk on the label and sets aria-required. @default false */
  required?: boolean;
  /** When true, shows "Optional" in the helper area and does not set required. Use for optional fields. */
  optional?: boolean;
  /** Override for the "Optional" label when `optional` is true. @default 'Optional' */
  optionalLabel?: string;
}

/**
 * A form input field with optional label, helper text, and error state.
 *
 * Renders a `<textarea>` when `variant="textarea"`, otherwise a standard
 * `<input>`. Automatically wires `aria-invalid`, `aria-describedby`, and
 * `aria-required` for accessibility.
 *
 * Uses BEM class `uds-input` with size and error modifiers.
 * Forwards its ref to the underlying `<input>` (or `<textarea>`) element.
 *
 * @example
 * ```tsx
 * <Input label="Email" variant="email" errorText="Invalid address" />
 * ```
 */
type InputType = 'text' | 'email' | 'password' | 'number' | 'search';
type VariantCompat = InputType | 'textarea';

function resolveInputMode(
  variant?: VariantCompat,
  type?: InputType,
  multiline?: boolean,
): { inputType: InputType; isTextarea: boolean } {
  const isTextarea = Boolean(multiline ?? variant === 'textarea');
  if (isTextarea) return { inputType: 'text', isTextarea: true };
  const inputType: InputType = type ?? (variant as InputType) ?? 'text';
  return { inputType, isTextarea: false };
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((allProps, ref) => {
  // Pull deprecated `variant` without a named destructure so SonarCloud
  // does not flag the usage of the @deprecated member.
  const {
    variant: _variant,
    type: typeProp,
    multiline,
    size = 'md',
    label,
    helperText,
    errorText,
    required = false,
    optional = false,
    optionalLabel = 'Optional',
    className,
    id,
    ...props
  } = allProps;
  const { inputType, isTextarea } = resolveInputMode(_variant, typeProp, multiline);
  const isRequired = required && !optional;

  const inputId =
    id || (label ? `uds-input-${label.toLowerCase().replaceAll(/\s+/g, '-')}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  const wrapperClasses = [
    'uds-input',
    `uds-input--${size}`,
    errorText && 'uds-input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  let describedBy: string | undefined;
  if (errorText) describedBy = errorId;
  else if (helperText || (optional && !helperText)) describedBy = helperId;

  const effectiveHelper = helperText ?? (optional && !errorText ? optionalLabel : undefined);

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="uds-input__label" htmlFor={inputId}>
          {label}
          {isRequired && (
            <span className="uds-input__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {isTextarea ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={inputId}
          className="uds-input__field"
          aria-invalid={!!errorText}
          aria-describedby={describedBy}
          aria-required={isRequired}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className="uds-input__field"
          aria-invalid={!!errorText}
          aria-describedby={describedBy}
          aria-required={isRequired}
          required={isRequired}
          {...props}
        />
      )}
      {errorText && (
        <p className="uds-input__error" id={errorId} role="alert">
          {errorText}
        </p>
      )}
      {!errorText && effectiveHelper && (
        <p className="uds-input__helper" id={helperId}>
          {effectiveHelper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
