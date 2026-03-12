import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from '../../packages/react/src/components/Badge/Badge';

describe('Badge', () => {
  it('renders children as badge content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders label as fallback when no children provided', () => {
    render(<Badge label="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant modifier classes', () => {
    const { rerender } = render(<Badge variant="status">S</Badge>);
    expect(screen.getByText('S').closest('span')).toHaveClass('uds-badge--status');

    rerender(<Badge variant="count">42</Badge>);
    expect(screen.getByText('42').closest('span')).toHaveClass('uds-badge--count');

    rerender(<Badge variant="tag">Tag</Badge>);
    expect(screen.getByText('Tag').closest('span')).toHaveClass('uds-badge--tag');
  });

  it('applies size modifier classes', () => {
    const { rerender } = render(<Badge size="sm">S</Badge>);
    expect(screen.getByText('S').closest('span')).toHaveClass('uds-badge--sm');

    rerender(<Badge size="md">M</Badge>);
    expect(screen.getByText('M').closest('span')).toHaveClass('uds-badge--md');
  });

  it('applies a custom className', () => {
    render(<Badge className="my-badge">X</Badge>);
    expect(screen.getByText('X').closest('span')).toHaveClass('my-badge');
  });

  it('applies aria-label from label prop', () => {
    render(<Badge label="Success">Active</Badge>);
    expect(screen.getByText('Active').closest('span')).toHaveAttribute('aria-label', 'Success');
  });

  it('renders remove button when removable is true', () => {
    render(<Badge removable label="Tag" onRemove={vi.fn()}>Tag</Badge>);
    expect(screen.getByRole('button', { name: 'Remove Tag' })).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(<Badge removable label="Tag" onRemove={handleRemove}>Tag</Badge>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tag' }));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('does not render remove button when removable is not set', () => {
    render(<Badge label="Static">Static</Badge>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('forwards a ref object to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('uds-badge');
  });

  it('forwards a callback ref to the root span', () => {
    const callbackRef = vi.fn();
    render(<Badge ref={callbackRef}>CB</Badge>);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement);
  });
});
