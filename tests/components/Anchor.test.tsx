import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Anchor } from '../../packages/react/src/components/Anchor/Anchor';

const sampleItems = [
  { href: '#section-1', title: 'Section 1' },
  { href: '#section-2', title: 'Section 2' },
  { href: '#section-3', title: 'Section 3' },
];

describe('Anchor', () => {
  it('renders a nav element with the correct aria-label', () => {
    render(<Anchor items={sampleItems} />);
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
  });

  it('renders all provided anchor items as links', () => {
    render(<Anchor items={sampleItems} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent('Section 1');
    expect(links[1]).toHaveTextContent('Section 2');
    expect(links[2]).toHaveTextContent('Section 3');
  });

  it('sets correct href attributes on links', () => {
    render(<Anchor items={sampleItems} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '#section-1');
    expect(links[1]).toHaveAttribute('href', '#section-2');
    expect(links[2]).toHaveAttribute('href', '#section-3');
  });

  it('applies the uds-anchor BEM class to the nav', () => {
    const { container } = render(<Anchor items={sampleItems} />);
    expect(container.querySelector('.uds-anchor')).toBeInTheDocument();
  });

  it('applies uds-anchor__link class to each link', () => {
    const { container } = render(<Anchor items={sampleItems} />);
    const links = container.querySelectorAll('.uds-anchor__link');
    expect(links).toHaveLength(3);
  });

  it('passes through a custom className', () => {
    const { container } = render(<Anchor items={sampleItems} className="my-nav" />);
    const nav = container.querySelector('.uds-anchor');
    expect(nav).toHaveClass('uds-anchor');
    expect(nav).toHaveClass('my-nav');
  });

  it('applies smooth scroll style by default', () => {
    render(<Anchor items={sampleItems} />);
    const link = screen.getByRole('link', { name: 'Section 1' });
    expect(link).toHaveStyle({ scrollBehavior: 'smooth' });
  });

  it('does not apply smooth scroll style when smoothScroll is false', () => {
    render(<Anchor items={sampleItems} smoothScroll={false} />);
    const link = screen.getByRole('link', { name: 'Section 1' });
    expect(link).not.toHaveAttribute('style');
  });

  it('renders an empty list when no items are provided', () => {
    const { container } = render(<Anchor items={[]} />);
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(0);
  });

  it('renders a single item correctly', () => {
    render(<Anchor items={[{ href: '#solo', title: 'Solo Section' }]} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Solo Section');
    expect(links[0]).toHaveAttribute('href', '#solo');
  });
});
