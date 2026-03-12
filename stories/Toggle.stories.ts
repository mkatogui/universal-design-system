import type { Meta, StoryObj } from '@storybook/html';

interface ToggleArgs {
  checked: boolean;
  disabled: boolean;
  label: string;
  size: string;
}

const meta: Meta<ToggleArgs> = {
  title: 'Components/Toggle',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { checked: false, disabled: false, label: 'Enable notifications', size: 'md' },
  render: (args) => `
    <label class="uds-toggle uds-toggle--${args.size}">
      <input type="checkbox" class="uds-toggle__input" role="switch" aria-checked="${args.checked}" ${args.checked ? 'checked' : ''} ${args.disabled ? 'disabled' : ''} />
      <span class="uds-toggle__track"></span>
      <span class="uds-toggle__label">${args.label}</span>
    </label>
  `,
};

export default meta;
type Story = StoryObj<ToggleArgs>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
