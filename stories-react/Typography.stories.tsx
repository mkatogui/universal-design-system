import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@mkatogui/uds-react';

const meta: Meta<typeof Typography> = {
  title: 'UDS React/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: ['h1', 'h2', 'h3', 'body', 'caption', 'code'] } },
  args: { children: 'Sample text', variant: 'body' },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Body: Story = {};
export const H1: Story = { args: { variant: 'h1', children: 'Heading 1' } };
export const Caption: Story = { args: { variant: 'caption', children: 'Caption' } };
