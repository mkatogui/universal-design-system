/**
 * Dev-only warning when the app runs without `data-theme` on `<html>`.
 * Call once (e.g. in root or via <ThemeCheck />) to remind adopters to set a palette.
 */
declare const process: { env: { NODE_ENV?: string } };

let hasWarned = false;

export function warnIfNoTheme(): void {
  if (typeof document === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;
  if (hasWarned) return;

  const theme = document.documentElement.dataset.theme;
  if (theme != null && theme !== '') return;

  hasWarned = true;
  console.warn(
    '[UDS] No data-theme set on <html>. Theming will fall back to CSS defaults. Set e.g. <html data-theme="minimal-saas"> or document.documentElement.setAttribute("data-theme", "minimal-saas").',
  );
}
