import type { Meta, StoryObj } from '@storybook/html';

interface InputArgs {
  type: string;
  multiline: boolean;
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
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search'] },
    multiline: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: { type: 'text', multiline: false, size: 'md', placeholder: 'Enter text...', label: 'Label', disabled: false, error: '' },
  render: (args) => {
    const errorAttr = args.error ? `aria-invalid="true" aria-describedby="input-error"` : '';
    const errorMsg = args.error ? `<p id="input-error" class="uds-input__error" role="alert">${args.error}</p>` : '';
    const field = args.multiline
      ? `<textarea id="demo-input" class="uds-input__field" placeholder="${args.placeholder}" ${args.disabled ? 'disabled' : ''} ${errorAttr}></textarea>`
      : `<input id="demo-input" class="uds-input__field" type="${args.type}" placeholder="${args.placeholder}" ${args.disabled ? 'disabled' : ''} ${errorAttr} />`;
    return `
      <div class="uds-input uds-input--${args.size}" style="max-width: 320px;">
        <label class="uds-input__label" for="demo-input">${args.label}</label>
        ${field}
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
export const Search: Story = { args: { type: 'search', placeholder: 'Search...', label: 'Search' } };
export const Multiline: Story = { args: { multiline: true, label: 'Bio', placeholder: 'Tell us about yourself...' } };
