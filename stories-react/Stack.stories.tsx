import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@mkatogui/uds-react';

const meta: Meta<typeof Stack> = {
  title: 'UDS React/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    children: (
      <>
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Column: Story = {};
export const Row: Story = { args: { direction: 'row' } };
export const WithGap: Story = { args: { gap: 'lg' } };
