import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Carousel } from '../../packages/react/src/components/Carousel/Carousel';

const items = [
  <div key="1">Slide 1</div>,
  <div key="2">Slide 2</div>,
  <div key="3">Slide 3</div>,
];

describe('Carousel', () => {
  it('renders with region role and aria-roledescription', () => {
    render(<Carousel items={items} />);
    const region = screen.getByRole('region', { name: 'Content carousel' });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('renders all slides', () => {
    render(<Carousel items={items} />);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('renders prev/next arrows when showArrows is true', () => {
    render(<Carousel items={items} showArrows />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('renders dots when showDots is true', () => {
    render(<Carousel items={items} showDots />);
    const tablist = screen.getByRole('tablist', { name: 'Slide indicators' });
    expect(tablist).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('calls onSlideChange when next is clicked', () => {
    const onSlideChange = vi.fn();
    render(<Carousel items={items} showArrows onSlideChange={onSlideChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onSlideChange).toHaveBeenCalledWith(1);
  });

  it('returns null when items is empty', () => {
    const { container } = render(<Carousel items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
