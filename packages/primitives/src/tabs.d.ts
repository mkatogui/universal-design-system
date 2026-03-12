/**
 * Options for creating a tabs primitive.
 */
export interface TabsOptions {
  /** CSS selector for tab elements within the tablist. Default: '[role="tab"]'. */
  tabSelector?: string;
  /** CSS selector for panel elements. Default: '[role="tabpanel"]'. */
  panelSelector?: string;
  /** Container holding the panels. Defaults to tablistElement.parentElement. */
  panelContainer?: HTMLElement | null;
  /** 'horizontal' uses Left/Right arrows, 'vertical' uses Up/Down arrows. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /** 'automatic' activates on focus, 'manual' requires Enter/Space. Default: 'automatic'. */
  activation?: 'automatic' | 'manual';
  /** Index of the initially active tab. Default: 0. */
  defaultIndex?: number;
  /** Called with (activeTab, activePanel, index) when the active tab changes. */
  onChange?: (activeTab: HTMLElement, activePanel: HTMLElement | null, index: number) => void;
}

/**
 * Tabs controller returned by createTabs.
 */
export interface TabsController {
  /** Activate a specific tab by index. */
  activateTab(index: number): void;
  /** Remove all event listeners and ARIA attributes. */
  destroy(): void;
  /** Returns the index of the currently active tab. */
  getActiveIndex(): number;
  /** Returns the currently active tab element, or null. */
  getActiveTab(): HTMLElement | null;
  /** Returns the currently active panel element, or null. */
  getActivePanel(): HTMLElement | null;
  /** Re-link tabs and panels after DOM changes. */
  refresh(): void;
}

/**
 * Create an accessible tabs primitive with roving tabindex, arrow key navigation,
 * Home/End support, and automatic or manual activation modes.
 */
export declare function createTabs(
  tablistElement: HTMLElement,
  options?: TabsOptions
): TabsController;
