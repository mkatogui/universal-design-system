import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Popconfirm } from '../../packages/react/src/components/Popconfirm/Popconfirm';

describe('Popconfirm', () => {
  it('renders trigger button with children', () => {
    render(
      <Popconfirm title="Are you sure?" onConfirm={vi.fn()}>
        Delete
      </Popconfirm>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('applies uds-popconfirm class', () => {
    const { container } = render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()}>
        Click
      </Popconfirm>,
    );
    expect(container.querySelector('.uds-popconfirm')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} className="custom-pop">
        Click
      </Popconfirm>,
    );
    expect(container.querySelector('.uds-popconfirm')).toHaveClass('custom-pop');
  });

  it('does not show the panel initially', () => {
    render(
      <Popconfirm title="Delete this?" onConfirm={vi.fn()}>
        Delete
      </Popconfirm>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the panel when trigger is clicked', () => {
    render(
      <Popconfirm title="Delete this?" onConfirm={vi.fn()}>
        Delete
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete this?')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Popconfirm title="Delete?" description="This action cannot be undone." onConfirm={vi.fn()}>
        Delete
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(
      <Popconfirm title="Delete?" onConfirm={vi.fn()}>
        Delete
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.queryByText('This action cannot be undone.')).not.toBeInTheDocument();
  });

  it('uses default Confirm and Cancel labels', () => {
    render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()}>
        Trigger
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('uses custom confirm and cancel labels', () => {
    render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} confirmLabel="Yes" cancelLabel="No">
        Trigger
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onConfirm and closes panel when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <Popconfirm title="Sure?" onConfirm={handleConfirm}>
        Trigger
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByText('Confirm'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onCancel and closes panel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} onCancel={handleCancel}>
        Trigger
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} open={false} onOpenChange={handleOpenChange}>
        Trigger
      </Popconfirm>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} open={true} onOpenChange={handleOpenChange}>
        Trigger
      </Popconfirm>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onOpenChange when trigger is clicked', () => {
    const handleOpenChange = vi.fn();
    render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()} onOpenChange={handleOpenChange}>
        Trigger
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it('has the trigger button with uds-popconfirm__trigger class', () => {
    const { container } = render(
      <Popconfirm title="Sure?" onConfirm={vi.fn()}>
        Trigger
      </Popconfirm>,
    );
    expect(container.querySelector('.uds-popconfirm__trigger')).toBeInTheDocument();
  });

  it('has displayName', () => {
    expect(Popconfirm.displayName).toBe('Popconfirm');
  });
});
