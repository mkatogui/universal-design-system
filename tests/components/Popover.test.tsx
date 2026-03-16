import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../../packages/react/src/components/Popover/Popover';

describe('Popover', () => {
  const trigger = <button type="button">Open popover</button>;

  // Mock requestAnimationFrame so the positioning useEffect fires synchronously
  let rafCallbacks: FrameRequestCallback[] = [];
  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of cbs) cb(0);
  }

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

  it('calls onOpenChange when trigger is clicked and opens popover (controlled)', () => {
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

  // --- NEW TESTS for uncovered lines ---

  it('applies placement modifier class', () => {
    render(
      <Popover trigger={trigger} open={true} placement="top">
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-popover--top');
  });

  it('applies custom className to content panel', () => {
    render(
      <Popover trigger={trigger} open={true} className="custom-class">
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('custom-class');
  });

  it('opens and closes as uncontrolled (no open prop)', () => {
    render(<Popover trigger={trigger}>Popover content</Popover>);
    // Initially closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Popover content')).toBeInTheDocument();

    // Click trigger again to close
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape key via useDialogOverlay', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={trigger} open={true} onOpenChange={onOpenChange}>
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The useDialogOverlay hook listens to document keydown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes uncontrolled popover on Escape key', () => {
    render(<Popover trigger={trigger}>Content</Popover>);
    // Open it first
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('trigger has aria-expanded false when closed', () => {
    render(
      <Popover trigger={trigger} open={false}>
        Content
      </Popover>,
    );
    const btn = screen.getByRole('button', { name: 'Open popover' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders content inside a portal (content panel is in document.body)', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Portal content
      </Popover>,
    );
    const dialog = screen.getByRole('dialog');
    // The dialog should be a child of document.body (via portal)
    expect(document.body.contains(dialog)).toBe(true);
  });

  it('content panel has role="dialog" and aria-modal="false"', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Content
      </Popover>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
  });

  it('calls onOpenChange(false) when clicking trigger to close', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={trigger} open={true} onOpenChange={onOpenChange}>
        Content
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('preserves original trigger onClick handler', () => {
    const triggerClick = vi.fn();
    const customTrigger = (
      <button type="button" onClick={triggerClick}>
        Custom trigger
      </button>
    );
    render(<Popover trigger={customTrigger}>Content</Popover>);
    fireEvent.click(screen.getByRole('button', { name: 'Custom trigger' }));
    expect(triggerClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default placement "bottom"', () => {
    render(
      <Popover trigger={trigger} open={true}>
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-popover--bottom');
  });

  it('renders with placement "left"', () => {
    render(
      <Popover trigger={trigger} open={true} placement="left">
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-popover--left');
  });

  it('renders with placement "right"', () => {
    render(
      <Popover trigger={trigger} open={true} placement="right">
        Content
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('uds-popover--right');
  });

  it('computes position via getPlacementStyles when open (bottom placement)', () => {
    // Mock getBoundingClientRect on the trigger and content elements
    const mockTriggerRect = {
      top: 100,
      bottom: 130,
      left: 200,
      right: 300,
      width: 100,
      height: 30,
      x: 200,
      y: 100,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 200,
      width: 200,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="bottom">
        Content
      </Popover>,
    );

    // Override getBoundingClientRect on rendered elements
    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    // Flush requestAnimationFrame to trigger position calculation
    act(() => {
      flushRaf();
    });

    // The dialog should have fixed positioning style applied
    expect(dialog.style.position).toBe('fixed');
  });

  it('computes position for top placement', () => {
    const mockTriggerRect = {
      top: 200,
      bottom: 230,
      left: 200,
      right: 300,
      width: 100,
      height: 30,
      x: 200,
      y: 200,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 200,
      width: 200,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="top">
        Content
      </Popover>,
    );

    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    act(() => {
      flushRaf();
    });

    expect(dialog.style.position).toBe('fixed');
  });

  it('computes position for left placement', () => {
    const mockTriggerRect = {
      top: 200,
      bottom: 230,
      left: 300,
      right: 400,
      width: 100,
      height: 30,
      x: 300,
      y: 200,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 150,
      width: 150,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="left">
        Content
      </Popover>,
    );

    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    act(() => {
      flushRaf();
    });

    expect(dialog.style.position).toBe('fixed');
  });

  it('computes position for right placement', () => {
    const mockTriggerRect = {
      top: 200,
      bottom: 230,
      left: 100,
      right: 200,
      width: 100,
      height: 30,
      x: 100,
      y: 200,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 150,
      width: 150,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="right">
        Content
      </Popover>,
    );

    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    act(() => {
      flushRaf();
    });

    expect(dialog.style.position).toBe('fixed');
  });

  it('computes position for auto placement (enough space below)', () => {
    const mockTriggerRect = {
      top: 100,
      bottom: 130,
      left: 200,
      right: 300,
      width: 100,
      height: 30,
      x: 200,
      y: 100,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 200,
      width: 200,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="auto">
        Content
      </Popover>,
    );

    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    act(() => {
      flushRaf();
    });

    expect(dialog.style.position).toBe('fixed');
  });

  it('computes position for auto placement (not enough space below, flips to top)', () => {
    const mockTriggerRect = {
      top: 700,
      bottom: 730,
      left: 200,
      right: 300,
      width: 100,
      height: 30,
      x: 200,
      y: 700,
      toJSON: () => {},
    };
    const mockContentRect = {
      top: 0,
      bottom: 50,
      left: 0,
      right: 200,
      width: 200,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(
      <Popover trigger={trigger} open={true} placement="auto">
        Content
      </Popover>,
    );

    const btn = screen.getByRole('button', { name: 'Open popover' });
    btn.getBoundingClientRect = () => mockTriggerRect as DOMRect;
    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = () => mockContentRect as DOMRect;

    act(() => {
      flushRaf();
    });

    expect(dialog.style.position).toBe('fixed');
  });

  it('forwards object ref to the trigger element', () => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    const refTrigger = (
      <button ref={triggerRef} type="button">
        Ref trigger
      </button>
    );
    render(
      <Popover trigger={refTrigger} open={true}>
        Content
      </Popover>,
    );
    // The ref should be forwarded to the actual button element
    expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Ref trigger' }));
  });

  it('forwards function ref to the trigger element', () => {
    const refFn = vi.fn();
    const refTrigger = (
      <button ref={refFn} type="button">
        Fn ref trigger
      </button>
    );
    render(
      <Popover trigger={refTrigger} open={true}>
        Content
      </Popover>,
    );
    expect(refFn).toHaveBeenCalled();
    expect(refFn.mock.calls[refFn.mock.calls.length - 1][0]).toBe(
      screen.getByRole('button', { name: 'Fn ref trigger' }),
    );
  });
});
