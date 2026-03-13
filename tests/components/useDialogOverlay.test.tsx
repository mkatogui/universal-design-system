import { fireEvent, render, screen } from '@testing-library/react';
import React, { useRef } from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { useDialogOverlay } from '../../packages/react/src/utils/useDialogOverlay';

function TestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useDialogOverlay(open, onClose, ref);

  if (!open) return null;
  return (
    <div ref={ref} role="dialog" data-testid="dialog">
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  );
}

describe('useDialogOverlay', () => {
  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(<TestDialog open={true} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for non-Escape keys', () => {
    const handleClose = vi.fn();
    render(<TestDialog open={true} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('traps focus: Shift+Tab on first element wraps to last', () => {
    render(<TestDialog open={true} onClose={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const first = buttons[0];
    const last = buttons[1];
    first.focus();
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('traps focus: Tab on last element wraps to first', () => {
    render(<TestDialog open={true} onClose={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const first = buttons[0];
    const last = buttons[1];
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(first);
  });

  it('does not trap when Tab is in the middle', () => {
    render(<TestDialog open={true} onClose={vi.fn()} />);
    // Focus is not on first or last, so Tab should not be prevented
    fireEvent.keyDown(document, { key: 'Tab' });
    // No error, just a passthrough
  });

  it('locks body scroll when open', () => {
    const { unmount } = render(<TestDialog open={true} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not render when closed', () => {
    render(<TestDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
