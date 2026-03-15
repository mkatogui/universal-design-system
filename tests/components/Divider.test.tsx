import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Divider } from '../../packages/react/src/components/Divider/Divider';

describe('Divider', () => {
  it('renders hr with uds-divider and role separator', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr.uds-divider');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveClass('uds-divider--horizontal');
  });

  it('applies vertical and dashed variant', () => {
    const { container } = render(<Divider orientation="vertical" variant="dashed" />);
    expect(container.querySelector('hr')).toHaveClass('uds-divider--vertical');
    expect(container.querySelector('hr')).toHaveClass('uds-divider--dashed');
  });
});
