import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from '../../packages/react/src/components/Breadcrumb/Breadcrumb';

const defaultItems = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Components' },
];

describe('Breadcrumb', () => {
  it('renders a nav with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={defaultItems} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all item labels', () => {
    render(<Breadcrumb items={defaultItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
  });

  it('renders anchor links for items with href (except the last)', () => {
    render(<Breadcrumb items={defaultItems} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveClass('uds-breadcrumb__link');

    const docsLink = screen.getByRole('link', { name: 'Docs' });
    expect(docsLink).toHaveAttribute('href', '/docs');
  });

  it('renders the last item as plain text with aria-current="page"', () => {
    render(<Breadcrumb items={defaultItems} />);
    const current = screen.getByText('Components');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders the default "/" separator between items', () => {
    const { container } = render(<Breadcrumb items={defaultItems} />);
    const separators = container.querySelectorAll('.uds-breadcrumb__separator');
    // 3 items → 2 separators
    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveTextContent('/');
  });

  it('renders a custom separator', () => {
    const { container } = render(<Breadcrumb items={defaultItems} separator=">" />);
    const separators = container.querySelectorAll('.uds-breadcrumb__separator');
    expect(separators[0]).toHaveTextContent('>');
  });

  it('truncates items with ellipsis when maxItems is exceeded', () => {
    const manyItems = [
      { label: 'Home', href: '/' },
      { label: 'Level 1', href: '/l1' },
      { label: 'Level 2', href: '/l2' },
      { label: 'Level 3', href: '/l3' },
      { label: 'Current' },
    ];
    render(<Breadcrumb items={manyItems} maxItems={3} />);
    expect(screen.getByText('...')).toBeInTheDocument();
    // First and last items should still be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('applies a custom className to the nav', () => {
    render(<Breadcrumb items={defaultItems} className="custom-bc" />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass('custom-bc');
  });

  it('forwards a ref object to the root nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={defaultItems} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('forwards a callback ref to the root nav element', () => {
    const callbackRef = vi.fn();
    render(<Breadcrumb ref={callbackRef} items={defaultItems} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
