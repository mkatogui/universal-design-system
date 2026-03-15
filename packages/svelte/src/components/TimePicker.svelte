<script lang="ts">
  interface Props {
    value?: string;
    size?: 'md' | 'lg';
    disabled?: boolean;
    onChange?: (v: string) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value = '',
    size = 'md',
    disabled = false,
    onChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(['uds-time-picker', `uds-time-picker--${size}`, className].filter(Boolean).join(' '));
</script>

<input
  type="time"
  value={value}
  class={classes}
  {disabled}
  aria-label="Time"
  oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
  {...rest}
/>
