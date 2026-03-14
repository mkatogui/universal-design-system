import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from '../../packages/react/src/components/Tabs/Tabs';

const defaultTabs = [
  { label: 'Overview', content: <div>Overview content</div> },
  { label: 'Details', content: <div>Details content</div> },
  { label: 'Settings', content: <div>Settings content</div> },
];

describe('Tabs', () => {
  it('renders all tab triggers', () => {
    render(<Tabs tabs={defaultTabs} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  it('shows the first tab panel by default', () => {
    render(<Tabs tabs={defaultTabs} />);
    expect(screen.getByText('Overview content')).toBeVisible();
  });

  it('switches to the clicked tab', () => {
    render(<Tabs tabs={defaultTabs} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when a tab is selected', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={defaultTabs} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('applies variant and size modifier classes', () => {
    const { container } = render(<Tabs tabs={defaultTabs} variant="pill" size="lg" />);
    const root = container.querySelector('.uds-tabs');
    expect(root).toHaveClass('uds-tabs--pill');
    expect(root).toHaveClass('uds-tabs--lg');
  });

  it('sets the default active tab via defaultIndex', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={1} />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates right with ArrowRight key', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates left with ArrowLeft key', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={1} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowDown key', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowUp key', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={1} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowUp' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to the first tab with Home key', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={2} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to the last tab with End key', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={0} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps around from the last tab to first with ArrowRight', () => {
    render(<Tabs tabs={defaultTabs} defaultIndex={2} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs during keyboard navigation', () => {
    const tabsWithDisabled = [
      { label: 'First', content: <div>First</div> },
      { label: 'Disabled', content: <div>Disabled</div>, disabled: true },
      { label: 'Third', content: <div>Third</div> },
    ];
    render(<Tabs tabs={tabsWithDisabled} defaultIndex={0} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Third' })).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled tabs have the disabled attribute', () => {
    const tabsWithDisabled = [
      { label: 'Active', content: <div>Active</div> },
      { label: 'Locked', content: <div>Locked</div>, disabled: true },
    ];
    render(<Tabs tabs={tabsWithDisabled} />);
    expect(screen.getByRole('tab', { name: 'Locked' })).toBeDisabled();
  });

  it('applies additional className to the root wrapper', () => {
    const { container } = render(<Tabs tabs={defaultTabs} className="custom-tabs" />);
    expect(container.querySelector('.uds-tabs')).toHaveClass('custom-tabs');
  });

  it('does not change active tab when an unhandled key is pressed', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'Tab' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('wires aria-controls and aria-labelledby between tabs and panels', () => {
    render(<Tabs tabs={defaultTabs} />);
    const firstTab = screen.getByRole('tab', { name: 'Overview' });
    const tabId = firstTab.getAttribute('id');
    const panelId = firstTab.getAttribute('aria-controls');
    expect(tabId).toBeTruthy();
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId ?? '');
    expect(panel).toHaveAttribute('aria-labelledby', tabId);
  });
});
