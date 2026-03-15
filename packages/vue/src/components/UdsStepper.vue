<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface StepperStep {
  id: string
  label: string
  optional?: boolean
}

interface Props {
  steps: StepperStep[]
  activeStep?: number
  defaultActiveStep?: number
  orientation?: 'horizontal' | 'vertical'
  linear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultActiveStep: 0,
  orientation: 'horizontal',
  linear: true,
})

const emit = defineEmits<{
  change: [index: number]
  stepClick: [index: number]
}>()

const internalStep = ref(props.defaultActiveStep)
const activeStep = computed(() => props.activeStep ?? internalStep.value)

watch(
  () => props.activeStep,
  (v) => { if (v !== undefined) internalStep.value = v },
)

const classes = computed(() =>
  ['uds-stepper', `uds-stepper--${props.orientation}`].filter(Boolean).join(' ')
)

function handleStepClick(index: number) {
  if (props.linear && index > activeStep.value) return
  if (props.activeStep === undefined) internalStep.value = index
  emit('change', index)
  emit('stepClick', index)
}
</script>

<template>
  <nav :class="classes" aria-label="Progress">
    <template v-for="(step, index) in steps" :key="step.id">
      <div
        :class="[
          'uds-stepper__step',
          index < activeStep && 'uds-stepper__step--completed',
          index === activeStep && 'uds-stepper__step--active',
          index > activeStep && 'uds-stepper__step--pending',
        ].filter(Boolean).join(' ')"
        :aria-current="index === activeStep ? 'step' : undefined"
        :aria-disabled="index > activeStep && linear ? 'true' : undefined"
        role="button"
        :tabindex="!linear || index <= activeStep ? 0 : -1"
        @click="(!linear || index <= activeStep) && handleStepClick(index)"
        @keydown.enter.prevent="(!linear || index <= activeStep) && handleStepClick(index)"
        @keydown.space.prevent="(!linear || index <= activeStep) && handleStepClick(index)"
      >
        <span class="uds-stepper__step-indicator">
          <template v-if="index < activeStep">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </template>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="uds-stepper__step-label">{{ step.label }}</span>
        <span v-if="step.optional" class="uds-stepper__step-optional">(optional)</span>
      </div>
      <span
        v-if="index < steps.length - 1"
        :class="['uds-stepper__connector', index < activeStep && 'uds-stepper__connector--completed'].filter(Boolean).join(' ')"
        aria-hidden="true"
      />
    </template>
  </nav>
</template>
