import type { Meta, StoryObj } from '@storybook/html';

interface InputArgs {
  variant: string;
  placeholder: string;
  label: string;
  disabled: boolean;
  error: string;
  size: string;
}

const meta: Meta<InputArgs> = {
  title: 'Components/Input',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'email', 'password', 'search', 'textarea', 'with-icon'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'text', size: 'md', placeholder: 'Enter text...', label: 'Label', disabled: false, error: '' },
  render: (args) => {
    const errorAttr = args.error ? `aria-invalid="true" aria-describedby="input-error"` : '';
    const errorMsg = args.error ? `<p id="input-error" class="uds-input__error" role="alert">${args.error}</p>` : '';
    return `
      <div class="uds-input uds-input--${args.size}" style="max-width: 320px;">
        <label class="uds-input__label" for="demo-input">${args.label}</label>
        <input id="demo-input" class="uds-input__field" type="${args.variant}" placeholder="${args.placeholder}" ${args.disabled ? 'disabled' : ''} ${errorAttr} />
        ${errorMsg}
      </div>
    `;
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'This field is required.' } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const Search: Story = { args: { variant: 'search', placeholder: 'Search...', label: 'Search' } };
