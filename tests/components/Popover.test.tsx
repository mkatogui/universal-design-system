import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Popover } from '../../packages/react/src/components/Popover/Popover';

describe('Popover', () => {
  const trigger = <button type="button">Open popover</button>;

  it('renders only the trigger when closed', () => {
    render(
      <Popover trigger={trigger} open={false}>
        Popover content
      </Popover>,
    );
    expect(screen.getByRole('button', { name: 'Open popover' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with content when open is true', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Popover content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('trigger has aria-haspopup and aria-expanded when open', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Content
      </Popover>,
    );
    const btn = screen.getByRole('button', { name: 'Open popover' });
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onOpenChange when trigger is clicked and opens popover (uncontrolled)', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={trigger} onOpenChange={onOpenChange}>
        Content
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('applies uds-popover class to content panel', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Content
      </Popover>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('uds-popover');
  });

  it('applies size modifier class', () => {
    render(
      <Popover trigger={trigger} open={true} size="sm">
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-popover--sm');
  });
});
