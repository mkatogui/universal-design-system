<script lang="ts">
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'search';
    multiline?: boolean;
    size?: 'sm' | 'md' | 'lg';
    state?: 'default' | 'focus' | 'error' | 'disabled' | 'readonly';
    label?: string;
    helperText?: string;
    errorText?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    value?: string;
    placeholder?: string;
    id?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    type = 'text',
    multiline = false,
    size = 'md',
    state = 'default',
    label = '',
    helperText = '',
    errorText = '',
    required = false,
    disabled = false,
    readonly: readOnly = false,
    value = $bindable(''),
    placeholder = '',
    id,
    class: className = '',
    ...rest
  }: Props = $props();

  let inputId = $derived(id || `uds-input-${Math.random().toString(36).slice(2, 9)}`);
  let helperId = $derived(`${inputId}-helper`);
  let errorId = $derived(`${inputId}-error`);
  let isError = $derived(state === 'error' || !!errorText);

  let classes = $derived(
    [
      'uds-input',
      `uds-input--${size}`,
      isError && 'uds-input--error',
      disabled && 'uds-input--disabled',
      readOnly && 'uds-input--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let describedBy = $derived(
    [errorText && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined
  );
</script>

<div class={classes}>
  {#if label}
    <label class="uds-input__label" for={inputId}>
      {label}
      {#if required}
        <span class="uds-input__required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}
  {#if multiline}
    <textarea
      class="uds-input__field"
      id={inputId}
      bind:value
      {placeholder}
      {required}
      {disabled}
      readonly={readOnly}
      aria-invalid={isError || undefined}
      aria-describedby={describedBy}
      {...rest}
    ></textarea>
  {:else}
    <input
      class="uds-input__field"
      type={type}
      id={inputId}
      bind:value
      {placeholder}
      {required}
      {disabled}
      readonly={readOnly}
      aria-invalid={isError || undefined}
      aria-describedby={describedBy}
      {...rest}
    />
  {/if}
  {#if errorText}
    <p class="uds-input__error" id={errorId} role="alert">{errorText}</p>
  {:else if helperText}
    <p class="uds-input__helper" id={helperId}>{helperText}</p>
  {/if}
</div>
