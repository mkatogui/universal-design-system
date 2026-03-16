import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Link } from '../../packages/react/src/components/Link/Link';

describe('Link', () => {
  it('renders anchor with uds-link and href', () => {
    render(<Link href="/path">Click</Link>);
    const a = screen.getByRole('link', { name: 'Click' });
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', '/path');
    expect(a).toHaveClass('uds-link--primary');
  });

  it('applies external rel and target when external', () => {
    render(
      <Link href="https://example.com" external>
        External
      </Link>,
    );
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(a).toHaveAttribute('target', '_blank');
  });
});
