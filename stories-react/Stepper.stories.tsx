import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from '@mkatogui/uds-react';

const steps = [
  { id: '1', label: 'Details' },
  { id: '2', label: 'Review', optional: true },
  { id: '3', label: 'Complete' },
];

const meta: Meta<typeof Stepper> = {
  title: 'UDS React/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: { control: 'number', min: 0, max: 2 },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    linear: { control: 'boolean' },
  },
  args: {
    steps,
    activeStep: 0,
    orientation: 'horizontal',
    linear: true,
  },
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {};
export const StepTwo: Story = { args: { activeStep: 1 } };
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const NonLinear: Story = { args: { linear: false, activeStep: 2 } };
