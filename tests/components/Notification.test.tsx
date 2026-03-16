import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Notification } from '../../packages/react/src/components/Notification/Notification';

const sampleItems = [
  { id: '1', message: 'Saved successfully', variant: 'success' as const },
  { id: '2', message: 'Something went wrong', variant: 'error' as const },
];

describe('Notification', () => {
  it('renders a section with aria-label', () => {
    render(<Notification items={sampleItems} />);
    const section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toBeInTheDocument();
  });

  it('applies uds-notification class and default top-right position', () => {
    render(<Notification items={sampleItems} />);
    const section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toHaveClass('uds-notification', 'uds-notification--top-right');
  });

  it('applies different position classes', () => {
    const { rerender } = render(<Notification items={sampleItems} position="top-left" />);
    let section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toHaveClass('uds-notification--top-left');

    rerender(<Notification items={sampleItems} position="bottom-right" />);
    section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toHaveClass('uds-notification--bottom-right');

    rerender(<Notification items={sampleItems} position="bottom-left" />);
    section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toHaveClass('uds-notification--bottom-left');
  });

  it('renders all notification items', () => {
    render(<Notification items={sampleItems} />);
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('applies variant classes to notification items', () => {
    const { container } = render(<Notification items={sampleItems} />);
    expect(container.querySelector('.uds-notification__item--success')).toBeInTheDocument();
    expect(container.querySelector('.uds-notification__item--error')).toBeInTheDocument();
  });

  it('defaults to neutral variant when not specified', () => {
    const items = [{ id: '1', message: 'Default notification' }];
    const { container } = render(<Notification items={items} />);
    expect(container.querySelector('.uds-notification__item--neutral')).toBeInTheDocument();
  });

  it('renders items using output elements', () => {
    const { container } = render(<Notification items={sampleItems} />);
    const outputs = container.querySelectorAll('output');
    expect(outputs).toHaveLength(2);
  });

  it('does not render dismiss buttons when onDismiss is not provided', () => {
    render(<Notification items={sampleItems} />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('renders dismiss buttons when onDismiss is provided', () => {
    render(<Notification items={sampleItems} onDismiss={vi.fn()} />);
    const buttons = screen.getAllByRole('button', { name: 'Dismiss' });
    expect(buttons).toHaveLength(2);
  });

  it('calls onDismiss with the correct id when dismiss is clicked', () => {
    const handleDismiss = vi.fn();
    render(<Notification items={sampleItems} onDismiss={handleDismiss} />);
    const buttons = screen.getAllByRole('button', { name: 'Dismiss' });
    fireEvent.click(buttons[0]);
    expect(handleDismiss).toHaveBeenCalledWith('1');
    fireEvent.click(buttons[1]);
    expect(handleDismiss).toHaveBeenCalledWith('2');
  });

  it('applies a custom className', () => {
    render(<Notification items={sampleItems} className="custom-notif" />);
    const section = screen.getByRole('region', { name: 'Notifications' });
    expect(section).toHaveClass('custom-notif');
  });

  it('renders warning and info variants', () => {
    const items = [
      { id: '1', message: 'Warning', variant: 'warning' as const },
      { id: '2', message: 'Info', variant: 'info' as const },
    ];
    const { container } = render(<Notification items={items} />);
    expect(container.querySelector('.uds-notification__item--warning')).toBeInTheDocument();
    expect(container.querySelector('.uds-notification__item--info')).toBeInTheDocument();
  });

  it('has displayName', () => {
    expect(Notification.displayName).toBe('Notification');
  });
});
