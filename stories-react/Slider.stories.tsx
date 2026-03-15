import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@mkatogui/uds-react';

const meta: Meta<typeof Slider> = {
  title: 'UDS React/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { value: 50, min: 0, max: 100 },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};
