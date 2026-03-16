import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { FloatButton } from '../../packages/react/src/components/FloatButton/FloatButton';

describe('FloatButton', () => {
  it('renders a button element', () => {
    render(<FloatButton aria-label="Add">+</FloatButton>);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<FloatButton aria-label="Add">+</FloatButton>);
    expect(screen.getByRole('button', { name: 'Add' })).toHaveTextContent('+');
  });

  it('has type="button" by default', () => {
    render(<FloatButton aria-label="Add">+</FloatButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies the uds-float-button base class', () => {
    const { container } = render(<FloatButton aria-label="Add">+</FloatButton>);
    expect(container.querySelector('.uds-float-button')).toBeInTheDocument();
  });

  it('applies default position, variant, and size classes', () => {
    const { container } = render(<FloatButton aria-label="Add">+</FloatButton>);
    const btn = container.querySelector('.uds-float-button');
    expect(btn).toHaveClass('uds-float-button--bottom-right');
    expect(btn).toHaveClass('uds-float-button--primary');
    expect(btn).toHaveClass('uds-float-button--md');
  });

  it('applies bottom-left position class', () => {
    const { container } = render(
      <FloatButton aria-label="Add" position="bottom-left">
        +
      </FloatButton>,
    );
    expect(container.querySelector('.uds-float-button')).toHaveClass(
      'uds-float-button--bottom-left',
    );
  });

  it('applies top-right position class', () => {
    const { container } = render(
      <FloatButton aria-label="Add" position="top-right">
        +
      </FloatButton>,
    );
    expect(container.querySelector('.uds-float-button')).toHaveClass('uds-float-button--top-right');
  });

  it('applies top-left position class', () => {
    const { container } = render(
      <FloatButton aria-label="Add" position="top-left">
        +
      </FloatButton>,
    );
    expect(container.querySelector('.uds-float-button')).toHaveClass('uds-float-button--top-left');
  });

  it('applies extended variant class', () => {
    const { container } = render(
      <FloatButton aria-label="Create" variant="extended">
        Create
      </FloatButton>,
    );
    expect(container.querySelector('.uds-float-button')).toHaveClass('uds-float-button--extended');
  });

  it('applies lg size class', () => {
    const { container } = render(
      <FloatButton aria-label="Add" size="lg">
        +
      </FloatButton>,
    );
    expect(container.querySelector('.uds-float-button')).toHaveClass('uds-float-button--lg');
  });

  it('passes through a custom className', () => {
    const { container } = render(
      <FloatButton aria-label="Add" className="my-fab">
        +
      </FloatButton>,
    );
    const btn = container.querySelector('.uds-float-button');
    expect(btn).toHaveClass('uds-float-button');
    expect(btn).toHaveClass('my-fab');
  });

  it('forwards a ref object to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <FloatButton ref={ref} aria-label="Add">
        +
      </FloatButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveClass('uds-float-button');
  });

  it('forwards a callback ref to the button element', () => {
    const callbackRef = vi.fn();
    render(
      <FloatButton ref={callbackRef} aria-label="Add">
        +
      </FloatButton>,
    );
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });

  it('spreads additional button attributes', () => {
    const handleClick = vi.fn();
    render(
      <FloatButton aria-label="Add" onClick={handleClick} disabled data-testid="fab">
        +
      </FloatButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('data-testid', 'fab');
  });

  it('sets aria-label as required', () => {
    render(<FloatButton aria-label="Scroll to top">Top</FloatButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Scroll to top');
  });
});
