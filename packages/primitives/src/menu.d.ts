/**
 * Options for creating a menu primitive.
 */
export interface MenuOptions {
  /** CSS selector for menu items. Default: '[role="menuitem"]'. */
  itemSelector?: string;
  /** Called with the selected menuitem element. */
  onSelect?: (item: HTMLElement) => void;
  /** Called when the menu opens. */
  onOpen?: () => void;
  /** Called when the menu closes. */
  onClose?: () => void;
  /** Whether selecting an item closes the menu. Default: true. */
  closeOnSelect?: boolean;
  /** Hint for consumer positioning. This primitive does not position. Default: 'bottom'. */
  placement?: string;
}

/**
 * Menu controller returned by createMenu.
 */
export interface MenuController {
  /** Open the menu and focus the first item. */
  open(): void;
  /** Close the menu and return focus to the trigger. */
  close(): void;
  /** Toggle the menu open/closed. */
  toggle(): void;
  /** Remove all event listeners and ARIA attributes. */
  destroy(): void;
  /** Returns true if the menu is currently open. */
  isOpen(): boolean;
  /** Re-initialize menu items after DOM changes. */
  refresh(): void;
}

/**
 * Create an accessible menu primitive with keyboard navigation, first-letter jumping,
 * focus management, and full ARIA support.
 */
export declare function createMenu(
  triggerElement: HTMLElement,
  menuElement: HTMLElement,
  options?: MenuOptions
): MenuController;
