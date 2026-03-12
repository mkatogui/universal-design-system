import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Testimonial } from '../../packages/react/src/components/Testimonial/Testimonial';

describe('Testimonial', () => {
  it('renders quote inside a blockquote element', () => {
    render(<Testimonial quote="Incredible design system!" />);
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent('Incredible design system!');
  });

  it('renders author name and title', () => {
    render(<Testimonial name="Jane Doe" title="CTO" company="Acme" />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('renders star rating with accessible aria-label and correct filled stars', () => {
    render(<Testimonial rating={4} />);
    const ratingEl = screen.getByLabelText('4 out of 5 stars');
    expect(ratingEl).toBeInTheDocument();
    const filledStars = ratingEl.querySelectorAll('.uds-testimonial__star--filled');
    expect(filledStars).toHaveLength(4);
  });

  it('renders avatar with descriptive alt text when name is provided', () => {
    render(<Testimonial avatar="/jane.png" name="Jane Doe" />);
    const avatar = screen.getByAltText("Jane Doe's avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/jane.png');
  });

  it('forwards ref with React.createRef', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Testimonial ref={ref} quote="Test quote" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards ref with callback ref', () => {
    const callbackRef = vi.fn();
    render(<Testimonial ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
