import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '@mkatogui/uds-react';

const meta: Meta<typeof Container> = {
  title: 'UDS React/Container',
  component: Container,
  tags: ['autodocs'],
  args: { children: 'Container content' },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Full: Story = { args: { size: 'full' } };
