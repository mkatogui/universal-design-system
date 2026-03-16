import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Container } from '../../packages/react/src/components/Container/Container';

describe('Container', () => {
  it('renders with uds-container and default size lg', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.querySelector('.uds-container')).toBeInTheDocument();
    expect(container.querySelector('.uds-container')).toHaveClass('uds-container--lg');
  });

  it('applies size sm', () => {
    const { container } = render(<Container size="sm">X</Container>);
    expect(container.querySelector('.uds-container')).toHaveClass('uds-container--sm');
  });
});
