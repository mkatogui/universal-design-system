import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Empty } from '../../packages/react/src/components/Empty/Empty';

describe('Empty', () => {
  it('renders the default title "No data"', () => {
    render(<Empty />);
    expect(screen.getByRole('heading', { name: 'No data' })).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<Empty title="Nothing here" />);
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
  });

  it('uses an h3 element for the title', () => {
    const { container } = render(<Empty title="Test" />);
    const heading = container.querySelector('.uds-empty__title');
    expect(heading?.tagName).toBe('H3');
  });

  it('renders an output element as the root', () => {
    const { container } = render(<Empty />);
    const output = container.querySelector('output');
    expect(output).toBeInTheDocument();
  });

  it('sets aria-label on the root output element matching the title', () => {
    render(<Empty title="No results" />);
    const output = screen.getByLabelText('No results');
    expect(output).toBeInTheDocument();
    expect(output.tagName).toBe('OUTPUT');
  });

  it('applies the uds-empty base class', () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('.uds-empty')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('.uds-empty__description')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Empty description="Try adjusting your search." />);
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
  });

  it('does not render illustration when not provided', () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('.uds-empty__illustration')).not.toBeInTheDocument();
  });

  it('renders illustration when provided', () => {
    const { container } = render(<Empty illustration={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(container.querySelector('.uds-empty__illustration')).toBeInTheDocument();
  });

  it('does not render action when not provided', () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('.uds-empty__action')).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<Empty action={<button type="button">Retry</button>} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('wraps action in the uds-empty__action container', () => {
    const { container } = render(<Empty action={<button type="button">Retry</button>} />);
    expect(container.querySelector('.uds-empty__action')).toBeInTheDocument();
  });

  it('passes through a custom className', () => {
    const { container } = render(<Empty className="my-empty" />);
    const root = container.querySelector('.uds-empty');
    expect(root).toHaveClass('uds-empty');
    expect(root).toHaveClass('my-empty');
  });

  it('renders all optional props together', () => {
    const { container } = render(
      <Empty
        title="Empty state"
        description="There are no items."
        illustration={<span>Icon</span>}
        action={<button type="button">Add Item</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Empty state' })).toBeInTheDocument();
    expect(screen.getByText('There are no items.')).toBeInTheDocument();
    expect(container.querySelector('.uds-empty__illustration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });
});
