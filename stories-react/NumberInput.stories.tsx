import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from '@mkatogui/uds-react';

const meta: Meta<typeof NumberInput> = {
  title: 'UDS React/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: { value: 10, min: 0, max: 100 },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {};
export const WithStepper: Story = { args: { showStepper: true } };
