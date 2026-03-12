import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '../../packages/react/src/components/Footer/Footer';

describe('Footer', () => {
  it('renders with aria-label "Site footer"', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo', { name: 'Site footer' })).toBeInTheDocument();
  });

  it('renders columns with titles and links', () => {
    const columns = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
      {
        title: 'Company',
        links: [{ label: 'About', href: '/about' }],
      },
    ];
    render(<Footer columns={columns} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/features');
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('renders copyright text and applies custom className', () => {
    render(<Footer copyright="2024 Acme Inc." className="my-footer" />);
    expect(screen.getByText('2024 Acme Inc.')).toBeInTheDocument();
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('uds-footer');
    expect(footer).toHaveClass('my-footer');
  });

  it('renders newsletter and legal slots', () => {
    render(
      <Footer
        newsletter={<form><input placeholder="Email" /></form>}
        legal={<span>Privacy Policy</span>}
      />,
    );
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('applies variant and size modifier classes', () => {
    render(<Footer variant="multi-column" size="compact" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('uds-footer--multi-column');
    expect(footer).toHaveClass('uds-footer--compact');
  });

  it('forwards a ref object to the footer element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Footer ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('FOOTER');
  });

  it('forwards a callback ref to the footer element', () => {
    const callbackRef = vi.fn();
    render(<Footer ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
