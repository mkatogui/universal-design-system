import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '@mkatogui/uds-react';

const meta: Meta<typeof ColorPicker> = {
  title: 'UDS React/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: { value: '#2563EB', label: 'Primary color' },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {};
