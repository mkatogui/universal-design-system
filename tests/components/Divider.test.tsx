import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Divider } from '../../packages/react/src/components/Divider/Divider';

describe('Divider', () => {
  it('renders hr with uds-divider (implicit separator role)', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr.uds-divider');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('uds-divider--horizontal');
  });

  it('applies vertical and dashed variant', () => {
    const { container } = render(<Divider orientation="vertical" variant="dashed" />);
    expect(container.querySelector('hr')).toHaveClass('uds-divider--vertical');
    expect(container.querySelector('hr')).toHaveClass('uds-divider--dashed');
  });
});
