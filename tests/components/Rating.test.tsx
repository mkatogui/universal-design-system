import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Rating } from '../../packages/react/src/components/Rating/Rating';

describe('Rating', () => {
  it('renders group with aria-label and star buttons', () => {
    render(<Rating value={2} max={5} />);
    const group = screen.getByRole('group', { name: 'Rating 2 of 5' });
    expect(group).toBeInTheDocument();
    expect(screen.getByLabelText('1 star')).toBeInTheDocument();
    expect(screen.getByLabelText('5 stars')).toBeInTheDocument();
  });
});
