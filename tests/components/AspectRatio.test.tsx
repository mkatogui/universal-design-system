import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from '../../packages/react/src/components/AspectRatio/AspectRatio';

describe('AspectRatio', () => {
  it('renders children inside the container', () => {
    render(
      <AspectRatio>
        <img alt="test" src="test.jpg" />
      </AspectRatio>,
    );
    expect(screen.getByAltText('test')).toBeInTheDocument();
  });

  it('applies the uds-aspect-ratio base class', () => {
    const { container } = render(<AspectRatio />);
    expect(container.querySelector('.uds-aspect-ratio')).toBeInTheDocument();
  });

  it('applies the default 16/9 ratio modifier class', () => {
    const { container } = render(<AspectRatio />);
    expect(container.querySelector('.uds-aspect-ratio--16-9')).toBeInTheDocument();
  });

  it('applies the 1/1 ratio modifier class', () => {
    const { container } = render(<AspectRatio ratio="1/1" />);
    expect(container.querySelector('.uds-aspect-ratio--1-1')).toBeInTheDocument();
  });

  it('applies the 4/3 ratio modifier class', () => {
    const { container } = render(<AspectRatio ratio="4/3" />);
    expect(container.querySelector('.uds-aspect-ratio--4-3')).toBeInTheDocument();
  });

  it('sets the correct aspectRatio inline style for the default ratio', () => {
    const { container } = render(<AspectRatio />);
    const el = container.querySelector('.uds-aspect-ratio');
    expect(el).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('sets the correct aspectRatio inline style for 1/1', () => {
    const { container } = render(<AspectRatio ratio="1/1" />);
    const el = container.querySelector('.uds-aspect-ratio');
    expect(el).toHaveStyle({ aspectRatio: '1/1' });
  });

  it('passes through a custom className', () => {
    const { container } = render(<AspectRatio className="custom-ratio" />);
    const el = container.querySelector('.uds-aspect-ratio');
    expect(el).toHaveClass('uds-aspect-ratio');
    expect(el).toHaveClass('custom-ratio');
  });

  it('forwards a ref object to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AspectRatio ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-aspect-ratio');
  });

  it('spreads additional HTML attributes onto the root div', () => {
    const { container } = render(<AspectRatio data-testid="ratio-box" id="my-ratio" />);
    const el = container.querySelector('.uds-aspect-ratio');
    expect(el).toHaveAttribute('data-testid', 'ratio-box');
    expect(el).toHaveAttribute('id', 'my-ratio');
  });

  it('renders without children', () => {
    const { container } = render(<AspectRatio />);
    const el = container.querySelector('.uds-aspect-ratio');
    expect(el).toBeInTheDocument();
    expect(el?.childNodes).toHaveLength(0);
  });
});
