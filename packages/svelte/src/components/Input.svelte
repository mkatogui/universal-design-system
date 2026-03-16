<script lang="ts">
  interface Props {
    /**
     * Native input type. Use with `multiline={false}` (default).
     * @default 'text'
     */
    type?: 'text' | 'email' | 'password' | 'number' | 'search';
    /** When true, renders a `<textarea>`; ignores `type`. @default false */
    multiline?: boolean;
    /**
     * @deprecated Use `type` and `multiline` instead. Kept for backward compatibility:
     * variant="textarea" -> multiline; variant="email" etc. -> type.
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
    /** When true, shows "Optional" in the helper area and does not set required. */
    optional?: boolean;
    /** Override for the "Optional" label when `optional` is true. @default 'Optional' */
    optionalLabel?: string;
    /** Element id. Derived from label if not provided. */
    id?: string;
    value?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    type: typeProp,
    multiline = false,
    variant,
    size = 'md',
    label,
    helperText,
    errorText,
    required = false,
    optional = false,
    optionalLabel = 'Optional',
    id,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();

  let isTextarea = $derived(Boolean(multiline || variant === 'textarea'));
  let inputType = $derived<'text' | 'email' | 'password' | 'number' | 'search'>(
    isTextarea ? 'text' : (typeProp ?? (variant as Props['type']) ?? 'text')
  );
  let isRequired = $derived(required && !optional);

  let inputId = $derived(
    id || (label ? `uds-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  );
  let errorId = $derived(inputId ? `${inputId}-error` : undefined);
  let helperId = $derived(inputId ? `${inputId}-helper` : undefined);

  let wrapperClasses = $derived(
    [
      'uds-input',
      `uds-input--${size}`,
      errorText && 'uds-input--error',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let describedBy = $derived<string | undefined>(
    errorText
      ? errorId
      : (helperText || (optional && !helperText))
        ? helperId
        : undefined
  );

  let effectiveHelper = $derived(
    helperText ?? (optional && !errorText ? optionalLabel : undefined)
  );
</script>

<div class={wrapperClasses}>
  {#if label}
    <label class="uds-input__label" for={inputId}>
      {label}
      {#if isRequired}
        <span class="uds-input__required" aria-hidden="true"> *</span>
      {/if}
    </label>
  {/if}
  {#if isTextarea}
    <textarea
      id={inputId}
      class="uds-input__field"
      aria-invalid={!!errorText}
      aria-describedby={describedBy}
      aria-required={isRequired}
      bind:value
      {...rest}
    ></textarea>
  {:else}
    <input
      id={inputId}
      type={inputType}
      class="uds-input__field"
      aria-invalid={!!errorText}
      aria-describedby={describedBy}
      aria-required={isRequired}
      required={isRequired}
      bind:value
      {...rest}
    />
  {/if}
  {#if errorText}
    <p class="uds-input__error" id={errorId} role="alert">
      {errorText}
    </p>
  {/if}
  {#if !errorText && effectiveHelper}
    <p class="uds-input__helper" id={helperId}>
      {effectiveHelper}
    </p>
  {/if}
</div>
