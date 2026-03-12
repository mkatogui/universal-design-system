import type { Meta, StoryObj } from '@storybook/html';

interface BadgeArgs {
  variant: string;
  label: string;
  size: string;
}

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error', 'info', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { variant: 'default', label: 'Badge', size: 'md' },
  render: (args) => `<span class="uds-badge uds-badge--${args.variant} uds-badge--${args.size}">${args.label}</span>`,
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = { args: { variant: 'default', label: 'Default' } };
export const Success: Story = { args: { variant: 'success', label: 'Active' } };
export const Warning: Story = { args: { variant: 'warning', label: 'Pending' } };
export const Error: Story = { args: { variant: 'error', label: 'Failed' } };
export const Info: Story = { args: { variant: 'info', label: 'New' } };
export const Outline: Story = { args: { variant: 'outline', label: 'v0.1.1' } };

export const AllVariants: Story = {
  render: () => `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <span class="uds-badge uds-badge--default uds-badge--md">Default</span>
      <span class="uds-badge uds-badge--success uds-badge--md">Active</span>
      <span class="uds-badge uds-badge--warning uds-badge--md">Pending</span>
      <span class="uds-badge uds-badge--error uds-badge--md">Failed</span>
      <span class="uds-badge uds-badge--info uds-badge--md">New</span>
      <span class="uds-badge uds-badge--outline uds-badge--md">v0.1.1</span>
    </div>
  `,
};
