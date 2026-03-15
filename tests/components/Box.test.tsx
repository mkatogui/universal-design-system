import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Box } from '../../packages/react/src/components/Box/Box';

describe('Box', () => {
  it('renders as div by default with uds-box class', () => {
    const { container } = render(<Box>Content</Box>);
    const el = container.querySelector('.uds-box');
    expect(el).toBeInTheDocument();
    expect(el?.tagName).toBe('DIV');
    expect(el).toHaveTextContent('Content');
  });

  it('applies padding and margin from props', () => {
    const { container } = render(<Box padding="4" margin="2">X</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.padding).toContain('space-4');
    expect(el.style.margin).toContain('space-2');
  });
});
