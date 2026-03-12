import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../../packages/react/src/components/Pagination/Pagination';

describe('Pagination', () => {
  it('renders a nav with aria-label="Pagination"', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('marks the active page button with aria-current="page"', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
    const activeBtn = screen.getByRole('button', { name: 'Page 3' });
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
    expect(activeBtn).toHaveClass('uds-pagination__page--active');
  });

  it('calls onPageChange with the correct page when a page button is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage - 1 when Previous is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage + 1 when Next is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('disables Previous button on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables Next button on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders ellipsis when total pages exceed the visible window', () => {
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />,
    );
    const ellipses = container.querySelectorAll('.uds-pagination__ellipsis');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('renders simple variant with page info text', () => {
    render(
      <Pagination variant="simple" currentPage={2} totalPages={8} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText('Page 2 of 8')).toBeInTheDocument();
  });

  it('renders load-more variant with a Load more button', () => {
    render(
      <Pagination variant="load-more" currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });

  it('disables Load more button when on the last page', () => {
    render(
      <Pagination variant="load-more" currentPage={5} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Load more' })).toBeDisabled();
  });

  it('applies variant and size modifier classes', () => {
    render(
      <Pagination variant="numbered" size="sm" currentPage={1} totalPages={3} onPageChange={vi.fn()} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveClass('uds-pagination--numbered');
    expect(nav).toHaveClass('uds-pagination--sm');
  });

  it('forwards a ref object to the nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Pagination ref={ref} currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('forwards a callback ref to the nav element', () => {
    const callbackRef = vi.fn();
    render(<Pagination ref={callbackRef} currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
