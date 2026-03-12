import type { Meta, StoryObj } from '@storybook/html';

interface ButtonArgs {
  variant: string;
  size: string;
  label: string;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'gradient', 'destructive', 'icon-only'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: { variant: 'primary', size: 'md', label: 'Button', disabled: false, loading: false, fullWidth: false },
  render: (args) => {
    const classes = [
      'uds-btn',
      `uds-btn--${args.variant}`,
      `uds-btn--${args.size}`,
      args.fullWidth ? 'uds-btn--full-width' : '',
      args.loading ? 'uds-btn--loading' : '',
    ].filter(Boolean).join(' ');
    return `<button class="${classes}" ${args.disabled ? 'disabled aria-disabled="true"' : ''} ${args.loading ? 'aria-busy="true"' : ''}>${args.label}</button>`;
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = { args: { variant: 'primary', label: 'Primary Button' } };
export const Secondary: Story = { args: { variant: 'secondary', label: 'Secondary Button' } };
export const Ghost: Story = { args: { variant: 'ghost', label: 'Ghost Button' } };
export const Gradient: Story = { args: { variant: 'gradient', label: 'Gradient Button' } };
export const Destructive: Story = { args: { variant: 'destructive', label: 'Delete Item' } };
export const Small: Story = { args: { size: 'sm', label: 'Small' } };
export const Large: Story = { args: { size: 'lg', label: 'Large' } };
export const ExtraLarge: Story = { args: { size: 'xl', label: 'Extra Large' } };
export const Disabled: Story = { args: { disabled: true, label: 'Disabled' } };
export const Loading: Story = { args: { loading: true, label: 'Loading...' } };
export const FullWidth: Story = { args: { fullWidth: true, label: 'Full Width' } };

export const AllVariants: Story = {
  render: () => `
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <button class="uds-btn uds-btn--primary uds-btn--md">Primary</button>
      <button class="uds-btn uds-btn--secondary uds-btn--md">Secondary</button>
      <button class="uds-btn uds-btn--ghost uds-btn--md">Ghost</button>
      <button class="uds-btn uds-btn--gradient uds-btn--md">Gradient</button>
      <button class="uds-btn uds-btn--destructive uds-btn--md">Destructive</button>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => `
    <div style="display: flex; gap: 1rem; align-items: center;">
      <button class="uds-btn uds-btn--primary uds-btn--sm">Small</button>
      <button class="uds-btn uds-btn--primary uds-btn--md">Medium</button>
      <button class="uds-btn uds-btn--primary uds-btn--lg">Large</button>
      <button class="uds-btn uds-btn--primary uds-btn--xl">Extra Large</button>
    </div>
  `,
};
