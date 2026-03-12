import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Hero } from '../../packages/react/src/components/Hero/Hero';

describe('Hero', () => {
  it('renders headline and subheadline', () => {
    render(<Hero headline="Ship faster" subheadline="Design system for modern teams" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Ship faster' })).toBeInTheDocument();
    expect(screen.getByText('Design system for modern teams')).toBeInTheDocument();
  });

  it('renders cta and visual slots', () => {
    render(
      <Hero
        cta={<button type="button">Get started</button>}
        visual={<img src="/screenshot.png" alt="Product screenshot" />}
      />,
    );
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Product screenshot' })).toBeInTheDocument();
  });

  it('applies variant and size modifier classes', () => {
    const { container } = render(<Hero variant="split" size="compact" />);
    const section = container.querySelector('.uds-hero');
    expect(section).toHaveClass('uds-hero--split');
    expect(section).toHaveClass('uds-hero--compact');
  });

  it('applies custom className', () => {
    const { container } = render(<Hero className="hero-custom" />);
    const section = container.querySelector('.uds-hero');
    expect(section).toHaveClass('hero-custom');
  });

  it('renders social proof slot', () => {
    render(<Hero socialProof={<span>Trusted by 10,000 teams</span>} />);
    expect(screen.getByText('Trusted by 10,000 teams')).toBeInTheDocument();
  });

  it('forwards a ref object to the section element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Hero ref={ref} headline="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SECTION');
  });

  it('forwards a callback ref to the section element', () => {
    const callbackRef = vi.fn();
    render(<Hero ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
