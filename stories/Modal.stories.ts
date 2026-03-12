import type { Meta, StoryObj } from '@storybook/html';

interface ModalArgs {
  title: string;
  body: string;
  size: string;
}

const meta: Meta<ModalArgs> = {
  title: 'Components/Modal',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { title: 'Confirm Action', body: 'Are you sure you want to proceed? This action cannot be undone.', size: 'md' },
  render: (args) => `
    <div class="uds-modal uds-modal--${args.size}" role="dialog" aria-modal="true" aria-labelledby="modal-title" style="position: relative; display: block;">
      <div class="uds-modal__overlay"></div>
      <div class="uds-modal__content">
        <div class="uds-modal__header">
          <h2 id="modal-title" class="uds-modal__title">${args.title}</h2>
          <button class="uds-modal__close" aria-label="Close modal">&times;</button>
        </div>
        <div class="uds-modal__body">
          <p>${args.body}</p>
        </div>
        <div class="uds-modal__footer">
          <button class="uds-btn uds-btn--secondary uds-btn--md">Cancel</button>
          <button class="uds-btn uds-btn--primary uds-btn--md">Confirm</button>
        </div>
      </div>
    </div>
  `,
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm', title: 'Quick Action', body: 'Delete this item?' } };
export const Large: Story = { args: { size: 'lg', title: 'Settings', body: 'Configure your preferences below.' } };
