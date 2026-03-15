<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    showHexInput?: boolean;
    disabled?: boolean;
    onChange?: (v: string) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value = '#000000',
    label,
    showHexInput = true,
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props();

  let id = $state('uds-cp-' + Math.random().toString(36).slice(2, 9));
  let classes = $derived(['uds-color-picker', className].filter(Boolean).join(' '));
</script>

<div class={classes}>
  {#if label}
    <label for={id} class="uds-color-picker__label">{label}</label>
  {/if}
  <div class="uds-color-picker__row">
    <input
      id={id}
      type="color"
      value={value}
      {disabled}
      class="uds-color-picker__swatch"
      aria-describedby={showHexInput ? `${id}-hex` : undefined}
      oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
    />
    {#if showHexInput}
      <input
        id="{id}-hex"
        type="text"
        value={value}
        {disabled}
        class="uds-color-picker__hex"
        aria-label="Hex color"
        oninput={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
      />
    {/if}
  </div>
</div>
