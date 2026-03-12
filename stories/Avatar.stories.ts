import type { Meta, StoryObj } from '@storybook/html';

interface AvatarArgs {
  size: string;
  initials: string;
  variant: string;
}

const meta: Meta<AvatarArgs> = {
  title: 'Components/Avatar',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['circle', 'rounded', 'square'] },
  },
  args: { size: 'md', initials: 'MK', variant: 'circle' },
  render: (args) => `
    <div class="uds-avatar uds-avatar--${args.size} uds-avatar--${args.variant}" role="img" aria-label="User avatar: ${args.initials}">
      <span class="uds-avatar__initials">${args.initials}</span>
    </div>
  `,
};

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const ExtraLarge: Story = { args: { size: 'xl' } };
export const Rounded: Story = { args: { variant: 'rounded' } };

export const AvatarGroup: Story = {
  render: () => `
    <div style="display: flex; gap: -8px;">
      <div class="uds-avatar uds-avatar--md uds-avatar--circle" role="img" aria-label="User A"><span class="uds-avatar__initials">AB</span></div>
      <div class="uds-avatar uds-avatar--md uds-avatar--circle" role="img" aria-label="User B"><span class="uds-avatar__initials">CD</span></div>
      <div class="uds-avatar uds-avatar--md uds-avatar--circle" role="img" aria-label="User C"><span class="uds-avatar__initials">EF</span></div>
    </div>
  `,
};
