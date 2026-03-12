import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { SocialProof } from '../../packages/react/src/components/SocialProof/SocialProof';

describe('SocialProof', () => {
  it('renders stats with value and label', () => {
    render(
      <SocialProof
        variant="stats-counter"
        stats={[
          { value: '10k+', label: 'active users' },
          { value: '99%', label: 'uptime' },
        ]}
      />,
    );
    expect(screen.getByText('10k+')).toBeInTheDocument();
    expect(screen.getByText('active users')).toBeInTheDocument();
    expect(screen.getByText('99%')).toBeInTheDocument();
    expect(screen.getByText('uptime')).toBeInTheDocument();
  });

  it('renders logos with alt text', () => {
    render(
      <SocialProof
        variant="logo-strip"
        logos={[
          { src: '/acme.svg', alt: 'Acme' },
          { src: '/globex.svg', alt: 'Globex' },
        ]}
      />,
    );
    expect(screen.getByAltText('Acme')).toBeInTheDocument();
    expect(screen.getByAltText('Globex')).toBeInTheDocument();
  });

  it('applies custom className and variant modifier', () => {
    const { container } = render(
      <SocialProof variant="combined" className="my-custom-class" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('uds-social-proof');
    expect(root).toHaveClass('uds-social-proof--combined');
    expect(root).toHaveClass('my-custom-class');
  });

  it('forwards ref with React.createRef', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SocialProof ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards ref with callback ref', () => {
    const callbackRef = vi.fn();
    render(<SocialProof ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
