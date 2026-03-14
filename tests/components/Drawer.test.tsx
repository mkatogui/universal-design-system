import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from '../../packages/react/src/components/Drawer/Drawer';

describe('Drawer', () => {
  it('does not render when open is false', () => {
    render(
      <Drawer open={false} onClose={vi.fn()}>
        Hidden
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open is true', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Settings">
        Content
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Settings');
  });

  it('renders title heading and body content', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Filters">
        <p>Filter options</p>
      </Drawer>,
    );
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Filter options')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose} title="Close Me">
        Body
      </Drawer>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose} title="Escape Test">
        Body
      </Drawer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose} title="Overlay Click">
        Body
      </Drawer>,
    );
    const overlay = document.querySelector('.uds-drawer-overlay') as HTMLElement;
    fireEvent.mouseDown(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies side class for right (default)', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Right">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--right');
  });

  it('applies side class for left', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Left" side="left">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--left');
  });

  it('applies side class for top', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Top" side="top">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--top');
  });

  it('applies side class for bottom', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Bottom" side="bottom">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--bottom');
  });

  it('applies size classes', () => {
    const { rerender } = render(
      <Drawer open={true} onClose={vi.fn()} title="SM" size="sm">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--sm');

    rerender(
      <Drawer open={true} onClose={vi.fn()} title="LG" size="lg">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--lg');
  });

  it('forwards a ref to the dialog element', () => {
    const ref = React.createRef<HTMLDialogElement>();
    render(
      <Drawer ref={ref} open={true} onClose={vi.fn()} title="Ref Test">
        Body
      </Drawer>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });

  it('renders without title (no header)', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <p>No title content</p>
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('No title content')).toBeInTheDocument();
  });

  it('locks body scroll when open and restores on close', () => {
    const { unmount } = render(
      <Drawer open={true} onClose={vi.fn()} title="Scroll Lock">
        Body
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('forwards a callback ref to the dialog element', () => {
    const callbackRef = vi.fn();
    render(
      <Drawer ref={callbackRef} open={true} onClose={vi.fn()} title="Callback Ref">
        Body
      </Drawer>,
    );
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDialogElement);
  });

  it('applies additional className', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Custom" className="custom-drawer">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('custom-drawer');
  });

  it('applies default size md', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Default Size">
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-drawer--md');
  });
});
