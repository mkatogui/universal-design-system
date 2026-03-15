import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@mkatogui/uds-react';

const meta: Meta<typeof Divider> = {
  title: 'UDS React/Divider',
  component: Divider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {};
export const Dashed: Story = { args: { variant: 'dashed' } };
export const Vertical: Story = { args: { orientation: 'vertical' } };
