import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { TimePicker } from '../../packages/react/src/components/TimePicker/TimePicker';

describe('TimePicker', () => {
  it('renders time input with value', () => {
    const { container } = render(<TimePicker value="14:30" />);
    const input = container.querySelector('input[type="time"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('value', '14:30');
  });
});
