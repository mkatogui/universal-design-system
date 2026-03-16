import { useEffect } from 'react';
import { warnIfNoTheme } from '../../utils/themeWarning';

/**
 * Renders nothing. In development, runs a one-time check and warns to the console
 * if `<html>` has no `data-theme` attribute, so adopters remember to set a palette.
 * Place once near the root of your app (e.g. next to your layout).
 */
export function ThemeCheck(): null {
  useEffect(() => {
    warnIfNoTheme();
  }, []);
  return null;
}

ThemeCheck.displayName = 'ThemeCheck';
