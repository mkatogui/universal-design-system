import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { AlertDialog } from '../../packages/react/src/components/AlertDialog/AlertDialog';

describe('AlertDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete item?',
    description: 'This action cannot be undone.',
  };

  it('does not render when open is false', () => {
    render(<AlertDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders with role="alertdialog" when open', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the title', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const titleId = dialog.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(screen.getByText('Delete item?')).toHaveAttribute('id', titleId);
  });

  it('has aria-describedby pointing to the description', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const descId = dialog.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(screen.getByText('This action cannot be undone.')).toHaveAttribute('id', descId);
  });

  it('renders confirm and cancel buttons with default labels', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(<AlertDialog {...defaultProps} confirmLabel="Delete" cancelLabel="Keep" />);
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const handleClose = vi.fn();
    render(<AlertDialog {...defaultProps} onClose={handleClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm and onClose when confirm is clicked', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    render(<AlertDialog {...defaultProps} onClose={handleClose} onConfirm={handleConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(<AlertDialog {...defaultProps} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies variant class for destructive', () => {
    render(<AlertDialog {...defaultProps} variant="destructive" />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveClass('uds-alert-dialog--destructive');
  });

  it('uses destructive button style for destructive variant', () => {
    render(<AlertDialog {...defaultProps} variant="destructive" />);
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn).toHaveClass('uds-btn--destructive');
  });

  it('forwards a ref to the dialog element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AlertDialog ref={ref} {...defaultProps} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'alertdialog');
  });
});
