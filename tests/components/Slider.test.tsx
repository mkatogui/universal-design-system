import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Slider } from '../../packages/react/src/components/Slider/Slider';

describe('Slider', () => {
  it('renders with role slider and aria attributes', () => {
    const { container } = render(<Slider value={50} min={0} max={100} onChange={() => {}} />);
    const input = container.querySelector('input[type="range"]');
    expect(input).toHaveAttribute('role', 'slider');
    expect(input).toHaveAttribute('aria-valuenow', '50');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '100');
  });
});
