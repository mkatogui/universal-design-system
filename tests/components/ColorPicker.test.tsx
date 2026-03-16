import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { ColorPicker } from '../../packages/react/src/components/ColorPicker/ColorPicker';

describe('ColorPicker', () => {
  it('renders color input and optional hex input', () => {
    render(<ColorPicker value="#ff0000" label="Color" />);
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Hex color' })).toBeInTheDocument();
  });
});
