import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Grid } from '../../packages/react/src/components/Grid/Grid';

describe('Grid', () => {
  it('renders with uds-grid and default columns', () => {
    const { container } = render(<Grid><div>Cell</div></Grid>);
    expect(container.querySelector('.uds-grid')).toBeInTheDocument();
    expect(container.querySelector('.uds-grid')).toHaveClass('uds-grid--cols-1');
  });

  it('applies columns and gap', () => {
    const { container } = render(<Grid columns={4} gap="lg"><div>X</div></Grid>);
    expect(container.querySelector('.uds-grid')).toHaveClass('uds-grid--cols-4');
    expect(container.querySelector('.uds-grid')).toHaveClass('uds-grid--gap-lg');
  });
});
