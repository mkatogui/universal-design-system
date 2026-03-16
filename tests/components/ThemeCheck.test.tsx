import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeCheck } from '../../packages/react/src/components/ThemeCheck/ThemeCheck';

describe('ThemeCheck', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('renders without crashing and produces no visible output', () => {
    const { container } = render(<ThemeCheck />);
    expect(container.firstChild).toBeNull();
  });

  it('warns once in development when data-theme is not set on document', () => {
    process.env.NODE_ENV = 'development';
    document.documentElement.removeAttribute('data-theme');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<ThemeCheck />);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('data-theme'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/UDS|minimal-saas/));
  });

  it('does not warn when data-theme is set', () => {
    process.env.NODE_ENV = 'development';
    document.documentElement.setAttribute('data-theme', 'minimal-saas');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<ThemeCheck />);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
