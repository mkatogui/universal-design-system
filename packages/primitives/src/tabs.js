/**
 * Tabs Primitive
 *
 * Accessible tabbed interface with roving tabindex, keyboard navigation,
 * and automatic or manual activation modes.
 *
 * Implements:
 * - role="tablist" on the tab container
 * - role="tab" on each tab trigger
 * - role="tabpanel" on each panel
 * - aria-selected on the active tab
 * - aria-controls linking tabs to panels
 * - aria-labelledby linking panels to tabs
 * - Roving tabindex: only the active tab is in the tab order
 * - Arrow keys (Left/Right or Up/Down for vertical) to move between tabs
 * - Home/End to jump to first/last tab
 * - Automatic activation: focus moves and activates simultaneously
 * - Manual activation: focus moves with arrows, Enter/Space to activate
 *
 * @module @mkatogui/uds-primitives/tabs
 */

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Create an accessible tabs primitive.
 *
 * @param {HTMLElement} tablistElement - The container for tab triggers (role="tablist").
 * @param {Object} [options]
 * @param {string} [options.tabSelector='[role="tab"]'] - CSS selector for tab elements within the tablist.
 * @param {string} [options.panelSelector='[role="tabpanel"]'] - CSS selector for panel elements.
 *   Panels are matched to tabs by order unless explicit aria-controls are set.
 * @param {HTMLElement} [options.panelContainer] - Container holding the panels. Defaults to
 *   tablistElement.parentElement.
 * @param {string} [options.orientation='horizontal'] - 'horizontal' uses Left/Right arrows,
 *   'vertical' uses Up/Down arrows.
 * @param {string} [options.activation='automatic'] - 'automatic' activates on focus,
 *   'manual' requires Enter/Space to activate.
 * @param {number} [options.defaultIndex=0] - Index of the initially active tab.
 * @param {Function} [options.onChange] - Called with (activeTab, activePanel, index) when
 *   the active tab changes.
 * @returns {Object} Tabs controller.
 */
export function createTabs(tablistElement, options = {}) {
  const {
    tabSelector = '[role="tab"]',
    panelSelector = '[role="tabpanel"]',
    panelContainer = null,
    orientation = 'horizontal',
    activation = 'automatic',
    defaultIndex = 0,
    onChange = null,
  } = options;

  let activeIndex = -1;
  let focusedIndex = -1;

  const panelParent = panelContainer || tablistElement.parentElement;

  // --- Helpers ---

  function getTabs() {
    return Array.from(tablistElement.querySelectorAll(tabSelector)).filter(
      (tab) => tab.getAttribute('aria-disabled') !== 'true'
    );
  }

  function getPanels() {
    return Array.from(panelParent.querySelectorAll(panelSelector));
  }

  function linkTabsAndPanels() {
    const tabs = getTabs();
    const panels = getPanels();

    tabs.forEach((tab, i) => {
      // Ensure IDs exist.
      if (!tab.id) {
        tab.id = uniqueId('uds-tab');
      }

      tab.setAttribute('role', 'tab');

      const panel = panels[i];
      if (panel) {
        if (!panel.id) {
          panel.id = uniqueId('uds-tabpanel');
        }

        panel.setAttribute('role', 'tabpanel');
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      }
    });
  }

  /**
   * Activate a specific tab by its index.
   *
   * Deactivates all tabs, sets `aria-selected="true"` and `tabindex="0"`
   * on the target tab, shows the corresponding panel (removes `hidden`),
   * hides all other panels, and fires the `onChange` callback.
   *
   * @param {number} index - Zero-based index of the tab to activate.
   */
  function activateTab(index) {
    const tabs = getTabs();
    const panels = getPanels();

    if (index < 0 || index >= tabs.length) return;

    // Deactivate all tabs.
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      const panel = panels[i];
      if (panel) {
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      }
    });

    activeIndex = index;

    if (typeof onChange === 'function') {
      onChange(tabs[index], panels[index] || null, index);
    }
  }

  function focusTab(index) {
    const tabs = getTabs();
    if (index < 0 || index >= tabs.length) return;

    focusedIndex = index;
    tabs[index].focus();

    if (activation === 'automatic') {
      activateTab(index);
    }
  }

  // --- Event handlers ---

  function handleKeyDown(event) {
    const tabs = getTabs();
    if (tabs.length === 0) return;

    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    // Find the currently focused tab index.
    const currentFocus = tabs.indexOf(document.activeElement);
    if (currentFocus === -1) return;

    let targetIndex = currentFocus;

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        targetIndex = currentFocus < tabs.length - 1 ? currentFocus + 1 : 0;
        focusTab(targetIndex);
        break;

      case prevKey:
        event.preventDefault();
        targetIndex = currentFocus > 0 ? currentFocus - 1 : tabs.length - 1;
        focusTab(targetIndex);
        break;

      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;

      case 'End':
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;

      case 'Enter':
      case ' ':
        if (activation === 'manual') {
          event.preventDefault();
          activateTab(currentFocus);
        }
        break;

      default:
        break;
    }
  }

  function handleClick(event) {
    const tab = event.target.closest(tabSelector);
    if (!tab || !tablistElement.contains(tab)) return;
    if (tab.getAttribute('aria-disabled') === 'true') return;

    const tabs = getTabs();
    const index = tabs.indexOf(tab);
    if (index !== -1) {
      focusTab(index);
      activateTab(index);
    }
  }

  // --- Initialize ---

  tablistElement.setAttribute('role', 'tablist');
  tablistElement.setAttribute('aria-orientation', orientation);

  linkTabsAndPanels();

  // Attach listeners.
  tablistElement.addEventListener('keydown', handleKeyDown);
  tablistElement.addEventListener('click', handleClick);

  // Activate the default tab.
  const initialIndex = Math.min(defaultIndex, getTabs().length - 1);
  if (initialIndex >= 0) {
    activateTab(initialIndex);
  }

  // --- Public API ---

  /**
   * Destroy the tabs primitive.
   *
   * Removes all event listeners and ARIA attributes that were set during
   * initialization (`role`, `aria-selected`, `tabindex`, `aria-controls`,
   * `aria-labelledby`, `aria-orientation`), and un-hides all panels.
   * After calling `destroy()`, the tabs instance should not be reused.
   */
  function destroy() {
    tablistElement.removeEventListener('keydown', handleKeyDown);
    tablistElement.removeEventListener('click', handleClick);

    tablistElement.removeAttribute('role');
    tablistElement.removeAttribute('aria-orientation');

    const tabs = getTabs();
    const panels = getPanels();
    tabs.forEach((tab) => {
      tab.removeAttribute('role');
      tab.removeAttribute('aria-selected');
      tab.removeAttribute('tabindex');
      tab.removeAttribute('aria-controls');
    });
    panels.forEach((panel) => {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.removeAttribute('hidden');
    });
  }

  return {
    activateTab,
    destroy,
    /**
     * Returns the zero-based index of the currently active tab.
     * @returns {number}
     */
    getActiveIndex: () => activeIndex,
    /**
     * Returns the currently active tab element, or `null` if none.
     * @returns {HTMLElement | null}
     */
    getActiveTab: () => {
      const tabs = getTabs();
      return tabs[activeIndex] || null;
    },
    /**
     * Returns the currently active panel element, or `null` if none.
     * @returns {HTMLElement | null}
     */
    getActivePanel: () => {
      const panels = getPanels();
      return panels[activeIndex] || null;
    },
    /**
     * Re-link tabs and panels after DOM changes.
     *
     * Call this after dynamically adding or removing tab/panel elements.
     * Re-assigns `aria-controls` and `aria-labelledby`, and re-activates
     * the current tab.
     */
    refresh: () => {
      linkTabsAndPanels();
      if (activeIndex >= 0) {
        activateTab(activeIndex);
      }
    },
  };
}
