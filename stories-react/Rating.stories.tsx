import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from '@mkatogui/uds-react';

const meta: Meta<typeof Rating> = {
  title: 'UDS React/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: { value: 3, max: 5 },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {};
export const Empty: Story = { args: { value: 0 } };
