import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Stack } from '../../packages/react/src/components/Stack/Stack';

describe('Stack', () => {
  it('renders with uds-stack and column direction by default', () => {
    const { container } = render(<Stack><span>A</span><span>B</span></Stack>);
    const el = container.querySelector('.uds-stack');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('uds-stack--column');
  });

  it('applies row direction and gap', () => {
    const { container } = render(<Stack direction="row" gap="sm"><span>X</span></Stack>);
    expect(container.querySelector('.uds-stack')).toHaveClass('uds-stack--row');
    expect(container.querySelector('.uds-stack')).toHaveClass('uds-stack--gap-sm');
  });
});
