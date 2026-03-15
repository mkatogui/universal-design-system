<script lang="ts">
  export interface StepperStep {
    id: string;
    label: string;
    optional?: boolean;
  }

  interface Props {
    steps: StepperStep[];
    activeStep?: number;
    defaultActiveStep?: number;
    orientation?: 'horizontal' | 'vertical';
    linear?: boolean;
    onStepClick?: (index: number) => void;
    onChange?: (index: number) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    steps,
    activeStep: controlledStep,
    defaultActiveStep = 0,
    orientation = 'horizontal',
    linear = true,
    onStepClick,
    onChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let internalStep = $state(defaultActiveStep);
  let activeStep = $derived(controlledStep ?? internalStep);

  let classes = $derived(
    ['uds-stepper', `uds-stepper--${orientation}`, className].filter(Boolean).join(' ')
  );

  function handleStepClick(index: number) {
    if (linear && index > activeStep) return;
    if (controlledStep === undefined) internalStep = index;
    onChange?.(index);
    onStepClick?.(index);
  }
</script>

<nav class={classes} aria-label="Progress" {...rest}>
  {#each steps as step, index}
    <div
      class="uds-stepper__step uds-stepper__step--{index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending'}"
      aria-current={index === activeStep ? 'step' : undefined}
      aria-disabled={index > activeStep && linear ? 'true' : undefined}
      role="button"
      tabindex={!linear || index <= activeStep ? 0 : -1}
      onclick={() => (!linear || index <= activeStep) && handleStepClick(index)}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (!linear || index <= activeStep) && (e.preventDefault(), handleStepClick(index))}
    >
      <span class="uds-stepper__step-indicator">
        {#if index < activeStep}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
        {:else}
          {index + 1}
        {/if}
      </span>
      <span class="uds-stepper__step-label">{step.label}</span>
      {#if step.optional}<span class="uds-stepper__step-optional">(optional)</span>{/if}
    </div>
    {#if index < steps.length - 1}
      <span class="uds-stepper__connector uds-stepper__connector--{index < activeStep ? 'completed' : ''}" aria-hidden="true"></span>
    {/if}
  {/each}
</nav>
