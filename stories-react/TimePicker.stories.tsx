import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from '@mkatogui/uds-react';

const meta: Meta<typeof TimePicker> = {
  title: 'UDS React/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: { value: '14:30' },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {};
