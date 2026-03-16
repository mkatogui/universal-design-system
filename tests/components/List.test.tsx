import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { List } from '../../packages/react/src/components/List/List';

describe('List', () => {
  it('renders a ul element by default (bullet variant)', () => {
    const { container } = render(<List items={['A', 'B']} />);
    const ul = container.querySelector('ul.uds-list');
    expect(ul).toBeInTheDocument();
    expect(ul).toHaveClass('uds-list--bullet');
  });

  it('renders items as li elements', () => {
    render(<List items={['Apple', 'Banana', 'Cherry']} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('renders li elements with uds-list__item class', () => {
    const { container } = render(<List items={['One']} />);
    const li = container.querySelector('li.uds-list__item');
    expect(li).toBeInTheDocument();
  });

  it('renders an ol element for numbered variant', () => {
    const { container } = render(<List variant="numbered" items={['First']} />);
    expect(container.querySelector('ol.uds-list')).toBeInTheDocument();
    expect(container.querySelector('ol')).toHaveClass('uds-list--numbered');
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('renders ul for "none" variant', () => {
    const { container } = render(<List variant="none" items={['Item']} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelector('ul')).toHaveClass('uds-list--none');
  });

  it('applies dense modifier class', () => {
    const { container } = render(<List dense items={['Dense']} />);
    expect(container.querySelector('ul')).toHaveClass('uds-list--dense');
  });

  it('does not apply dense class when dense is false', () => {
    const { container } = render(<List dense={false} items={['Normal']} />);
    expect(container.querySelector('ul')).not.toHaveClass('uds-list--dense');
  });

  it('applies a custom className', () => {
    const { container } = render(<List className="custom-list" items={['X']} />);
    expect(container.querySelector('ul')).toHaveClass('custom-list');
  });

  it('renders children when items prop is not provided', () => {
    render(
      <List>
        <li>Custom child</li>
      </List>,
    );
    expect(screen.getByText('Custom child')).toBeInTheDocument();
  });

  it('uses items over children when both are provided', () => {
    render(
      <List items={['Item from prop']}>
        <li>Child item</li>
      </List>,
    );
    expect(screen.getByText('Item from prop')).toBeInTheDocument();
    expect(screen.queryByText('Child item')).not.toBeInTheDocument();
  });

  it('forwards a ref to the list element', () => {
    const ref = React.createRef<HTMLUListElement>();
    render(<List ref={ref} items={['Ref test']} />);
    expect(ref.current).toBeInstanceOf(HTMLUListElement);
    expect(ref.current).toHaveClass('uds-list');
  });

  it('forwards a ref to ol when numbered variant', () => {
    const ref = React.createRef<HTMLOListElement>();
    render(<List ref={ref} variant="numbered" items={['Ref test']} />);
    expect(ref.current).toBeInstanceOf(HTMLOListElement);
  });

  it('has displayName', () => {
    expect(List.displayName).toBe('List');
  });
});
