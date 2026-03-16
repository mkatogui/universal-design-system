import { afterEach, describe, expect, it, vi } from 'vitest';
import { warnIfNoTheme } from '../../packages/react/src/utils/themeWarning';

describe('themeWarning', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('warns once in development when data-theme is not set', () => {
    process.env.NODE_ENV = 'development';
    document.documentElement.removeAttribute('data-theme');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnIfNoTheme();
    warnIfNoTheme(); // second call should not warn (hasWarned)

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('data-theme'));
  });

  it('does not warn when data-theme is set', () => {
    process.env.NODE_ENV = 'development';
    document.documentElement.setAttribute('data-theme', 'minimal-saas');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnIfNoTheme();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn in production', () => {
    process.env.NODE_ENV = 'production';
    document.documentElement.removeAttribute('data-theme');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnIfNoTheme();

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
