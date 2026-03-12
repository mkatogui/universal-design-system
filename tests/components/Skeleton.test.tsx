import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Skeleton } from '../../packages/react/src/components/Skeleton/Skeleton';

describe('Skeleton', () => {
  it('renders with aria-busy="true" and aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    const root = container.querySelector('.uds-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies animated class by default and omits it when animated is false', () => {
    const { container, rerender } = render(<Skeleton />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--animated');

    rerender(<Skeleton animated={false} />);
    expect(container.querySelector('.uds-skeleton')).not.toHaveClass('uds-skeleton--animated');
  });

  it('applies variant modifier classes: text, avatar, card, table', () => {
    const { container, rerender } = render(<Skeleton variant="text" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--text');

    rerender(<Skeleton variant="avatar" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--avatar');
    expect(container.querySelector('.uds-skeleton__circle')).toBeInTheDocument();

    rerender(<Skeleton variant="card" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--card');
    expect(container.querySelector('.uds-skeleton__image')).toBeInTheDocument();

    rerender(<Skeleton variant="table" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--table');
    expect(container.querySelector('.uds-skeleton__table')).toBeInTheDocument();
  });

  it('renders the correct number of lines for text variant', () => {
    const { container } = render(<Skeleton variant="text" lines={5} />);
    const lines = container.querySelectorAll('.uds-skeleton__line');
    expect(lines).toHaveLength(5);
  });

  it('applies size modifier classes', () => {
    const { container, rerender } = render(<Skeleton size="sm" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--sm');

    rerender(<Skeleton size="lg" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('uds-skeleton--lg');
  });

  it('applies a custom className', () => {
    const { container } = render(<Skeleton className="my-skeleton" />);
    expect(container.querySelector('.uds-skeleton')).toHaveClass('my-skeleton');
  });

  it('forwards a ref object to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-skeleton');
  });

  it('forwards a callback ref to the root div element', () => {
    const callbackRef = vi.fn();
    render(<Skeleton ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
