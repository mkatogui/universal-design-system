<script lang="ts">
  interface Props {
    length?: 4 | 6;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    autoFocus?: boolean;
    inputMode?: 'numeric' | 'text';
    disabled?: boolean;
    class?: string;
    [key: string]: unknown;
  }

  let {
    length = 4,
    value: controlledValue,
    defaultValue = '',
    onChange,
    autoFocus = false,
    inputMode = 'numeric',
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let internalValue = $state(defaultValue.slice(0, length));
  let value = $derived((controlledValue ?? internalValue).slice(0, length).padEnd(length, ''));

  let classes = $derived(
    ['uds-otp-input', disabled && 'uds-otp-input--disabled', className].filter(Boolean).join(' ')
  );

  function setValue(next: string) {
    const s = next.slice(0, length);
    if (controlledValue === undefined) internalValue = s;
    onChange?.(s);
  }

  function handleChange(index: number, digit: string) {
    const char = inputMode === 'numeric' ? digit.replace(/\D/g, '').slice(-1) : digit.slice(-1);
    const arr = value.split('');
    arr[index] = char;
    setValue(arr.join(''));
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && value[index] === '' && index > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.uds-otp-input__digit');
      inputs[index - 1]?.focus();
    }
  }
</script>

<div class={classes} role="group" aria-label="One-time code" {...rest}>
  {#each Array(length) as _, i}
    <input
      type="text"
      inputmode={inputMode}
      maxlength="1"
      autocomplete="one-time-code"
      class="uds-otp-input__digit"
      value={value[i] ?? ''}
      aria-label="Digit {i + 1}"
      disabled={disabled}
      autofocus={autoFocus && i === 0}
      oninput={(e) => handleChange(i, (e.currentTarget as HTMLInputElement).value)}
      onkeydown={(e) => handleKeydown(e, i)}
    />
  {/each}
</div>
