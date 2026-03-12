import type { Meta, StoryObj } from '@storybook/html';

interface TabsArgs {
  variant: string;
  tabs: string[];
  activeIndex: number;
}

const meta: Meta<TabsArgs> = {
  title: 'Components/Tabs',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'pills', 'underline', 'vertical'] },
    activeIndex: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: { variant: 'default', tabs: ['Overview', 'Features', 'Pricing', 'FAQ'], activeIndex: 0 },
  render: (args) => {
    const tabItems = args.tabs.map((tab, i) => {
      const isActive = i === args.activeIndex;
      return `<button role="tab" class="uds-tabs__tab ${isActive ? 'uds-tabs__tab--active' : ''}" aria-selected="${isActive}" tabindex="${isActive ? '0' : '-1'}">${tab}</button>`;
    }).join('');

    return `
      <div class="uds-tabs uds-tabs--${args.variant}">
        <div class="uds-tabs__list" role="tablist" aria-label="Section tabs">
          ${tabItems}
        </div>
        <div class="uds-tabs__panel" role="tabpanel" tabindex="0">
          <p>Content for the "${args.tabs[args.activeIndex]}" tab.</p>
        </div>
      </div>
    `;
  },
};

export default meta;
type Story = StoryObj<TabsArgs>;

export const Default: Story = {};
export const Pills: Story = { args: { variant: 'pills' } };
export const Underline: Story = { args: { variant: 'underline' } };
export const SecondTabActive: Story = { args: { activeIndex: 1 } };
