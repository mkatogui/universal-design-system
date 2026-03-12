import type { Meta, StoryObj } from '@storybook/html';

interface AlertArgs {
  variant: string;
  message: string;
  dismissible: boolean;
}

const meta: Meta<AlertArgs> = {
  title: 'Components/Alert',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error', 'neutral'] },
    dismissible: { control: 'boolean' },
  },
  args: { variant: 'info', message: 'This is an alert message.', dismissible: false },
  render: (args) => `
    <div class="uds-alert uds-alert--${args.variant}" role="alert">
      <span class="uds-alert__message">${args.message}</span>
      ${args.dismissible ? '<button class="uds-alert__dismiss" aria-label="Dismiss alert">&times;</button>' : ''}
    </div>
  `,
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Info: Story = { args: { variant: 'info', message: 'New updates are available.' } };
export const Success: Story = { args: { variant: 'success', message: 'Changes saved successfully.' } };
export const Warning: Story = { args: { variant: 'warning', message: 'Your session will expire in 5 minutes.' } };
export const Error: Story = { args: { variant: 'error', message: 'Failed to save changes. Please try again.' } };
export const Dismissible: Story = { args: { variant: 'info', dismissible: true, message: 'You can dismiss this alert.' } };

export const AllVariants: Story = {
  render: () => `
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 500px;">
      <div class="uds-alert uds-alert--info" role="alert"><span class="uds-alert__message">Info alert</span></div>
      <div class="uds-alert uds-alert--success" role="alert"><span class="uds-alert__message">Success alert</span></div>
      <div class="uds-alert uds-alert--warning" role="alert"><span class="uds-alert__message">Warning alert</span></div>
      <div class="uds-alert uds-alert--error" role="alert"><span class="uds-alert__message">Error alert</span></div>
    </div>
  `,
};
