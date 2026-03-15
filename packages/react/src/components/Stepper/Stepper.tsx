import React, { useCallback, useState } from 'react';

export interface StepperStep {
  id: string;
  label: string;
  optional?: boolean;
}

export interface StepperProps {
  /** Step definitions. */
  steps: StepperStep[];
  /** Current active step index (controlled). */
  activeStep?: number;
  /** Initial active step when uncontrolled. @default 0 */
  defaultActiveStep?: number;
  /** Layout direction. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** When true, steps are sequential (can't skip). @default true */
  linear?: boolean;
  /** Callback when a step is clicked (for non-linear). */
  onStepClick?: (index: number) => void;
  /** Called when active step changes. */
  onChange?: (index: number) => void;
  /** Additional CSS class for the root. */
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep: controlledActiveStep,
  defaultActiveStep = 0,
  orientation = 'horizontal',
  linear = true,
  onStepClick,
  onChange,
  className,
}) => {
  const [internalStep, setInternalStep] = useState(defaultActiveStep);
  const activeStep = controlledActiveStep ?? internalStep;

  const handleStepClick = useCallback(
    (index: number) => {
      if (linear && index > activeStep) return;
      if (controlledActiveStep === undefined) setInternalStep(index);
      onChange?.(index);
      onStepClick?.(index);
    },
    [activeStep, linear, controlledActiveStep, onChange, onStepClick],
  );

  const classes = ['uds-stepper', `uds-stepper--${orientation}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classes} aria-label="Progress">
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isCurrent = index === activeStep;
        const isPending = index > activeStep;
        const isClickable = !linear || index <= activeStep;

        return (
          <React.Fragment key={step.id}>
            {/* biome-ignore lint/a11y/useSemanticElements: step div uses role=button for a11y */}
            <div
              className={[
                'uds-stepper__step',
                isCompleted && 'uds-stepper__step--completed',
                isCurrent && 'uds-stepper__step--active',
                isPending && 'uds-stepper__step--pending',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
              aria-disabled={isPending && linear ? 'true' : undefined}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              onClick={() => isClickable && handleStepClick(index)}
              onKeyDown={(e) => {
                if (!isClickable) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStepClick(index);
                }
              }}
            >
              <span className="uds-stepper__step-indicator">
                {isCompleted ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="uds-stepper__step-label">{step.label}</span>
              {step.optional && <span className="uds-stepper__step-optional">(optional)</span>}
            </div>
            {index < steps.length - 1 && (
              <span
                className={[
                  'uds-stepper__connector',
                  isCompleted && 'uds-stepper__connector--completed',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

Stepper.displayName = 'Stepper';
