import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@mkatogui/uds-react';

const meta: Meta<typeof Form> = {
  title: 'UDS React/Form',
  component: Form,
  tags: ['autodocs'],
  args: { children: 'Form content' },
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = { args: { children: <><label>Name</label><input type="text" /></> } };
