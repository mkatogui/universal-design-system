import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '@mkatogui/uds-react';

const meta: Meta<typeof Grid> = {
  title: 'UDS React/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: {
    children: (
      <>
        <div>Cell 1</div>
        <div>Cell 2</div>
        <div>Cell 3</div>
        <div>Cell 4</div>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Default: Story = {};
export const TwoColumns: Story = { args: { columns: 2 } };
export const FourColumns: Story = { args: { columns: 4, gap: 'md' } };
