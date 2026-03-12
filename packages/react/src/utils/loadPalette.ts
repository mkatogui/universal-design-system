/**
 * Load a custom palette at runtime by injecting its CSS into the document.
 *
 * @param name - The palette slug (e.g. 'my-brand')
 * @param cssText - Optional CSS text to inject directly. If not provided,
 *                  attempts to fetch from the package's bundled palettes.
 *
 * @example
 * ```tsx
 * import { loadCustomPalette } from '@mkatogui/uds-react';
 *
 * // Load palette CSS (provide the CSS text from your build)
 * loadCustomPalette('my-brand', myBrandCSS);
 *
 * // Then apply it
 * document.documentElement.setAttribute('data-theme', 'my-brand');
 * ```
 */
export function loadCustomPalette(name: string, cssText: string): void {
  if (typeof document === 'undefined') return;

  const id = `uds-custom-palette-${name}`;
  let style = document.getElementById(id) as HTMLStyleElement | null;

  if (style) {
    style.textContent = cssText;
    return;
  }

  style = document.createElement('style');
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}

/**
 * Remove a previously loaded custom palette.
 */
export function unloadCustomPalette(name: string): void {
  if (typeof document === 'undefined') return;

  const id = `uds-custom-palette-${name}`;
  const style = document.getElementById(id);
  if (style) {
    style.remove();
  }
}
