import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Icon } from '../../packages/react/src/components/Icon/Icon';

describe('Icon', () => {
  it('renders with default props', () => {
    const { container } = render(<Icon />);
    const el = container.querySelector('span.uds-icon');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('uds-icon--md');
  });

  it('renders the name as a symbol when no children provided', () => {
    render(<Icon name="star" />);
    expect(screen.getByText('star')).toBeInTheDocument();
    expect(screen.getByText('star')).toHaveClass('uds-icon__symbol');
  });

  it('renders children instead of name when both provided', () => {
    render(
      <Icon name="star">
        <svg data-testid="custom-svg" />
      </Icon>,
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
    expect(screen.queryByText('star')).not.toBeInTheDocument();
  });

  it('applies size variant classes', () => {
    const { container, rerender } = render(<Icon size="sm" />);
    expect(container.querySelector('span.uds-icon')).toHaveClass('uds-icon--sm');

    rerender(<Icon size="lg" />);
    expect(container.querySelector('span.uds-icon')).toHaveClass('uds-icon--lg');
  });

  it('applies custom color as inline style', () => {
    const { container } = render(<Icon color="red" />);
    expect(container.querySelector('span.uds-icon')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('does not set inline color style when color is not provided', () => {
    const { container } = render(<Icon />);
    const el = container.querySelector('span.uds-icon') as HTMLElement;
    expect(el.style.color).toBe('');
  });

  it('applies a custom className', () => {
    const { container } = render(<Icon className="my-icon" />);
    expect(container.querySelector('span.uds-icon')).toHaveClass('my-icon');
  });

  it('is decorative (aria-hidden) by default', () => {
    const { container } = render(<Icon name="star" />);
    const el = container.querySelector('span.uds-icon');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not have role="img" when decorative', () => {
    const { container } = render(<Icon name="star" decorative />);
    const el = container.querySelector('span.uds-icon');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('aria-label');
  });

  it('sets role="img" and aria-label when not decorative', () => {
    const { container } = render(<Icon name="star" decorative={false} />);
    const el = container.querySelector('span.uds-icon');
    expect(el).toHaveAttribute('aria-hidden', 'false');
    expect(el).toHaveAttribute('role', 'img');
    expect(el).toHaveAttribute('aria-label', 'star');
  });

  it('has displayName', () => {
    expect(Icon.displayName).toBe('Icon');
  });
});
