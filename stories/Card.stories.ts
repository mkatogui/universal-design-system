import type { Meta, StoryObj } from '@storybook/html';

interface CardArgs {
  variant: string;
  title: string;
  description: string;
}

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['icon-top', 'image-top', 'horizontal', 'stat-card', 'dashboard-preview'] },
  },
  args: { variant: 'icon-top', title: 'Feature Card', description: 'A card component using design tokens for consistent theming.' },
  render: (args) => `
    <div class="uds-card uds-card--${args.variant}" style="max-width: 360px;">
      <div class="uds-card__header">
        <h3 class="uds-card__title">${args.title}</h3>
      </div>
      <div class="uds-card__body">
        <p>${args.description}</p>
      </div>
    </div>
  `,
};

export default meta;
type Story = StoryObj<CardArgs>;

export const IconTop: Story = { args: { variant: 'icon-top' } };
export const ImageTop: Story = { args: { variant: 'image-top' } };
export const Horizontal: Story = { args: { variant: 'horizontal' } };
export const StatCard: Story = { args: { variant: 'stat-card', title: '1,234', description: 'Active users this month' } };

export const CardGrid: Story = {
  render: () => `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 800px;">
      <div class="uds-card uds-card--icon-top">
        <div class="uds-card__header"><h3 class="uds-card__title">Performance</h3></div>
        <div class="uds-card__body"><p>Optimized for speed and efficiency.</p></div>
      </div>
      <div class="uds-card uds-card--icon-top">
        <div class="uds-card__header"><h3 class="uds-card__title">Security</h3></div>
        <div class="uds-card__body"><p>Built with security best practices.</p></div>
      </div>
      <div class="uds-card uds-card--icon-top">
        <div class="uds-card__header"><h3 class="uds-card__title">Scalability</h3></div>
        <div class="uds-card__body"><p>Scales with your growing needs.</p></div>
      </div>
    </div>
  `,
};
