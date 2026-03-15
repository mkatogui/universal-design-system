import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mkatogui/uds-react';

const meta: Meta<typeof Box> = {
  title: 'UDS React/Box',
  component: Box,
  tags: ['autodocs'],
  args: { children: 'Box content' },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {};
export const WithPadding: Story = { args: { padding: '4', children: 'Padded' } };
