import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Typography } from '../../packages/react/src/components/Typography/Typography';

describe('Typography', () => {
  it('renders as p with body variant by default', () => {
    const { container } = render(<Typography>Body text</Typography>);
    const el = container.querySelector('p.uds-typography');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('uds-typography--body');
  });

  it('renders as h1 when variant is h1', () => {
    const { container } = render(<Typography variant="h1">Heading</Typography>);
    const el = container.querySelector('h1.uds-typography--h1');
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('Heading');
  });
});
