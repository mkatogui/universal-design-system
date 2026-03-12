/**
 * UDS Primitives -- Unstyled, accessible component primitives.
 *
 * Framework-agnostic headless components for the 5 hardest accessibility
 * patterns: Dialog, Combobox, Tabs, Menu, and Tooltip.
 *
 * Each primitive follows WAI-ARIA Authoring Practices and provides:
 * - Complete keyboard navigation
 * - Correct ARIA roles, states, and properties
 * - Focus management (trapping, roving tabindex, restoration)
 * - No visual styling -- consumers provide all CSS
 *
 * @module @mkatogui/uds-primitives
 * @see https://www.w3.org/WAI/ARIA/apg/
 */

/**
 * Create an accessible modal dialog with focus trap, Escape to close,
 * backdrop click to close, and scroll lock.
 *
 * @see {@link module:@mkatogui/uds-primitives/dialog}
 */
export { createDialog } from './dialog.js';

/**
 * Create an accessible combobox (autocomplete/typeahead) with keyboard
 * navigation, filtering, and listbox management.
 *
 * @see {@link module:@mkatogui/uds-primitives/combobox}
 */
export { createCombobox } from './combobox.js';

/**
 * Create an accessible tabbed interface with roving tabindex, arrow key
 * navigation, and automatic or manual activation.
 *
 * @see {@link module:@mkatogui/uds-primitives/tabs}
 */
export { createTabs } from './tabs.js';

/**
 * Create an accessible dropdown menu with keyboard navigation,
 * first-letter jumping, and focus management.
 *
 * @see {@link module:@mkatogui/uds-primitives/menu}
 */
export { createMenu } from './menu.js';

/**
 * Create an accessible tooltip that shows on hover and focus, hides
 * on Escape, with configurable delays.
 *
 * @see {@link module:@mkatogui/uds-primitives/tooltip}
 */
export { createTooltip } from './tooltip.js';
