import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@mkatogui/uds-react';

const meta: Meta<typeof Link> = {
  title: 'UDS React/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '#', children: 'Link text' },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};
export const Muted: Story = { args: { variant: 'muted' } };
export const External: Story = { args: { href: 'https://example.com', external: true, children: 'External link' } };
