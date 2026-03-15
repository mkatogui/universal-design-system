import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mkatogui/uds-react';

const meta: Meta<typeof Button> = {
  title: 'UDS React/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'gradient', 'destructive', 'icon-only'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary', children: 'Primary Button' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Large' } };
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
export const Loading: Story = { args: { loading: true, children: 'Loading...' } };
