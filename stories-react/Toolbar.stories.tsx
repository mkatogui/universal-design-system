import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar, Button } from '@mkatogui/uds-react';

const meta: Meta<typeof Toolbar> = {
  title: 'UDS React/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    'aria-label': 'Formatting',
    orientation: 'horizontal',
  },
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  args: { 'aria-label': 'Formatting' },
  render: (args) => (
    <Toolbar {...args}>
      <Button variant="ghost" size="sm">
        B
      </Button>
      <Button variant="ghost" size="sm">
        I
      </Button>
      <Button variant="ghost" size="sm">
        U
      </Button>
    </Toolbar>
  ),
};

export const Vertical: Story = {
  args: { 'aria-label': 'Actions', orientation: 'vertical' },
  render: (args) => (
    <Toolbar {...args}>
      <Button variant="primary" size="sm">
        Save
      </Button>
      <Button variant="secondary" size="sm">
        Cancel
      </Button>
    </Toolbar>
  ),
};
