/**
 * Menu Primitive
 *
 * Accessible dropdown menu with keyboard navigation, first-letter jumping,
 * focus management, and full ARIA support.
 *
 * Implements:
 * - role="menu" on the menu container
 * - role="menuitem" on each item
 * - aria-expanded on the trigger button
 * - aria-haspopup="true" on the trigger button
 * - Arrow key navigation (Up/Down)
 * - Home/End to jump to first/last item
 * - First-letter navigation: typing a character focuses the next item starting with that letter
 * - Escape to close the menu and return focus to the trigger
 * - Enter/Space to activate the focused item
 * - Focus moves into the menu on open, returns to trigger on close
 *
 * @module @mkatogui/uds-primitives/menu
 */

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Create an accessible menu primitive.
 *
 * @param {HTMLElement} triggerElement - The button that toggles the menu.
 * @param {HTMLElement} menuElement - The container for menu items (role="menu").
 * @param {Object} [options]
 * @param {string} [options.itemSelector='[role="menuitem"]'] - CSS selector for menu items.
 * @param {Function} [options.onSelect] - Called with the selected menuitem element.
 * @param {Function} [options.onOpen] - Called when the menu opens.
 * @param {Function} [options.onClose] - Called when the menu closes.
 * @param {boolean} [options.closeOnSelect=true] - Whether selecting an item closes the menu.
 * @param {string} [options.placement='bottom'] - Hint for consumer positioning ('bottom', 'top', etc.).
 *   This primitive does not position — the consumer handles all styling.
 * @returns {Object} Menu controller.
 */
export function createMenu(triggerElement, menuElement, options = {}) {
  const {
    itemSelector = '[role="menuitem"]',
    onSelect = null,
    onOpen = null,
    onClose = null,
    closeOnSelect = true,
  } = options;

  let isOpen = false;
  let activeIndex = -1;
  let searchString = '';
  let searchTimeout = null;

  // Generate IDs for ARIA linking.
  const menuId = menuElement.id || uniqueId('uds-menu');
  menuElement.id = menuId;

  // Set ARIA on trigger.
  triggerElement.setAttribute('aria-haspopup', 'true');
  triggerElement.setAttribute('aria-expanded', 'false');
  triggerElement.setAttribute('aria-controls', menuId);

  // Set ARIA on menu.
  menuElement.setAttribute('role', 'menu');

  // --- Helpers ---

  function getItems() {
    return Array.from(menuElement.querySelectorAll(itemSelector)).filter(
      (item) =>
        item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('hidden')
    );
  }

  function setActiveItem(index) {
    const items = getItems();

    // Clear previous.
    items.forEach((item) => {
      item.setAttribute('tabindex', '-1');
      item.classList.remove('uds-menu-active');
    });

    if (index >= 0 && index < items.length) {
      activeIndex = index;
      items[activeIndex].setAttribute('tabindex', '0');
      items[activeIndex].classList.add('uds-menu-active');
      items[activeIndex].focus();
    } else {
      activeIndex = -1;
    }
  }

  /**
   * First-letter navigation: find the next item whose text starts with the
   * given character, wrapping around.
   */
  function findByFirstLetter(char) {
    const items = getItems();
    if (items.length === 0) return -1;

    const lowerChar = char.toLowerCase();
    const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;

    // Search from current position to end.
    for (let i = startIndex; i < items.length; i++) {
      if (items[i].textContent.trim().toLowerCase().startsWith(lowerChar)) {
        return i;
      }
    }

    // Wrap around from beginning to current position.
    for (let i = 0; i < startIndex; i++) {
      if (items[i].textContent.trim().toLowerCase().startsWith(lowerChar)) {
        return i;
      }
    }

    return -1;
  }

  // --- Open / Close ---

  /**
   * Open the menu.
   *
   * Sets `aria-expanded="true"` on the trigger, removes the `hidden`
   * attribute from the menu, focuses the first menu item, and fires
   * the `onOpen` callback. Registers a document-level click listener
   * to close the menu when clicking outside.
   *
   * No-op if the menu is already open.
   */
  function open() {
    if (isOpen) return;
    isOpen = true;

    triggerElement.setAttribute('aria-expanded', 'true');
    menuElement.removeAttribute('hidden');

    // Focus the first item.
    const items = getItems();
    if (items.length > 0) {
      setActiveItem(0);
    }

    // Listen for outside clicks to close.
    requestAnimationFrame(() => {
      document.addEventListener('click', handleOutsideClick);
    });

    if (typeof onOpen === 'function') {
      onOpen();
    }
  }

  /**
   * Close the menu.
   *
   * Sets `aria-expanded="false"` on the trigger, hides the menu (sets
   * `hidden`), clears the active item state, removes the outside-click
   * listener, returns focus to the trigger, and fires the `onClose`
   * callback.
   *
   * No-op if the menu is already closed.
   */
  function close() {
    if (!isOpen) return;
    isOpen = false;

    triggerElement.setAttribute('aria-expanded', 'false');
    menuElement.setAttribute('hidden', '');

    // Clear active state.
    const items = getItems();
    items.forEach((item) => {
      item.setAttribute('tabindex', '-1');
      item.classList.remove('uds-menu-active');
    });
    activeIndex = -1;

    // Remove outside click listener.
    document.removeEventListener('click', handleOutsideClick);

    // Return focus to trigger.
    triggerElement.focus();

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  /**
   * Toggle the menu open or closed.
   */
  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // --- Event handlers ---

  function handleTriggerKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        open();
        break;

      case 'ArrowUp':
        event.preventDefault();
        open();
        // Focus last item when opening with ArrowUp.
        requestAnimationFrame(() => {
          const items = getItems();
          if (items.length > 0) {
            setActiveItem(items.length - 1);
          }
        });
        break;

      default:
        break;
    }
  }

  function handleMenuKeyDown(event) {
    const items = getItems();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (items.length > 0) {
          const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          setActiveItem(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (items.length > 0) {
          const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          setActiveItem(prevIndex);
        }
        break;

      case 'Home':
        event.preventDefault();
        if (items.length > 0) {
          setActiveItem(0);
        }
        break;

      case 'End':
        event.preventDefault();
        if (items.length > 0) {
          setActiveItem(items.length - 1);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          selectItem(items[activeIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        close();
        break;

      case 'Tab':
        // Close menu on Tab to allow natural focus flow.
        close();
        break;

      default:
        // First-letter navigation: single printable character.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          handleFirstLetter(event.key);
        }
        break;
    }
  }

  function handleFirstLetter(char) {
    // Clear search string after 500ms of inactivity for multi-character search.
    clearTimeout(searchTimeout);
    searchString += char;
    searchTimeout = setTimeout(() => {
      searchString = '';
    }, 500);

    const items = getItems();
    const lowerSearch = searchString.toLowerCase();
    const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;

    // Try multi-character match first.
    let found = -1;
    for (let i = 0; i < items.length; i++) {
      const idx = (startIndex + i) % items.length;
      if (items[idx].textContent.trim().toLowerCase().startsWith(lowerSearch)) {
        found = idx;
        break;
      }
    }

    // Fall back to single character if multi-char fails.
    if (found === -1 && searchString.length > 1) {
      found = findByFirstLetter(char);
    }

    if (found !== -1) {
      setActiveItem(found);
    }
  }

  /**
   * Select a menu item.
   *
   * Fires the `onSelect` callback, triggers a native click on the item,
   * and closes the menu if `closeOnSelect` is enabled.
   *
   * @param {HTMLElement} item - The menuitem element to select.
   */
  function selectItem(item) {
    if (typeof onSelect === 'function') {
      onSelect(item);
    }

    // Fire a click on the item so native behavior works.
    item.click();

    if (closeOnSelect) {
      close();
    }
  }

  function handleTriggerClick(event) {
    event.preventDefault();
    toggle();
  }

  function handleMenuClick(event) {
    const item = event.target.closest(itemSelector);
    if (item && menuElement.contains(item) && item.getAttribute('aria-disabled') !== 'true') {
      event.preventDefault();
      selectItem(item);
    }
  }

  function handleOutsideClick(event) {
    if (
      !menuElement.contains(event.target) &&
      !triggerElement.contains(event.target)
    ) {
      close();
    }
  }

  // --- Initialize ---

  // Ensure all items have role="menuitem" and tabindex.
  Array.from(menuElement.querySelectorAll(itemSelector)).forEach((item) => {
    if (!item.getAttribute('role')) {
      item.setAttribute('role', 'menuitem');
    }
    item.setAttribute('tabindex', '-1');
  });

  // Start hidden.
  menuElement.setAttribute('hidden', '');

  // Attach listeners.
  triggerElement.addEventListener('click', handleTriggerClick);
  triggerElement.addEventListener('keydown', handleTriggerKeyDown);
  menuElement.addEventListener('keydown', handleMenuKeyDown);
  menuElement.addEventListener('click', handleMenuClick);

  // --- Public API ---

  /**
   * Destroy the menu primitive.
   *
   * Closes the menu (if open), removes all event listeners (trigger
   * click, trigger keydown, menu keydown, menu click, outside click),
   * removes all ARIA attributes (`aria-haspopup`, `aria-expanded`,
   * `aria-controls`, `role`), un-hides the menu element, and clears
   * the first-letter search timeout. After calling `destroy()`, the
   * menu instance should not be reused.
   */
  function destroy() {
    close();
    triggerElement.removeEventListener('click', handleTriggerClick);
    triggerElement.removeEventListener('keydown', handleTriggerKeyDown);
    menuElement.removeEventListener('keydown', handleMenuKeyDown);
    menuElement.removeEventListener('click', handleMenuClick);
    document.removeEventListener('click', handleOutsideClick);

    triggerElement.removeAttribute('aria-haspopup');
    triggerElement.removeAttribute('aria-expanded');
    triggerElement.removeAttribute('aria-controls');
    menuElement.removeAttribute('role');
    menuElement.removeAttribute('hidden');

    clearTimeout(searchTimeout);
  }

  return {
    open,
    close,
    toggle,
    destroy,
    /**
     * Returns `true` if the menu is currently open, `false` otherwise.
     * @returns {boolean}
     */
    isOpen: () => isOpen,
    /**
     * Re-initialize menu items after DOM changes.
     *
     * Call this after dynamically adding or removing menuitem elements.
     * Ensures all items have `role="menuitem"` and `tabindex="-1"`, and
     * re-activates the current item if the menu is open.
     */
    refresh: () => {
      // Re-initialize items after DOM changes.
      Array.from(menuElement.querySelectorAll(itemSelector)).forEach((item) => {
        if (!item.getAttribute('role')) {
          item.setAttribute('role', 'menuitem');
        }
        item.setAttribute('tabindex', '-1');
      });
      // Re-set active if open.
      if (isOpen && activeIndex >= 0) {
        setActiveItem(activeIndex);
      }
    },
  };
}
