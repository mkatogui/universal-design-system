/**
 * Dialog Primitive
 *
 * Accessible modal dialog with focus trap, Escape to close, backdrop click
 * to close, and full ARIA support.
 *
 * Implements:
 * - role="dialog" and aria-modal="true"
 * - aria-labelledby pointing to the dialog title
 * - Focus trap: Tab/Shift+Tab cycle within the dialog
 * - Focus restoration: returns focus to trigger on close
 * - Escape key to close
 * - Backdrop click to close (optional)
 * - Scroll lock on body when open (optional)
 *
 * @module @mkatogui/uds-primitives/dialog
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-of-type',
].join(', ');

/**
 * Returns all focusable elements within a container, filtered to those
 * that are actually visible (not hidden by CSS or zero-dimension).
 */
function getFocusableElements(container) {
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') {
      return false;
    }
    return !el.hasAttribute('inert');
  });
}

/**
 * Generate a unique ID string.
 */
let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Create an accessible dialog primitive.
 *
 * @param {HTMLElement} dialogElement - The element that serves as the dialog container.
 * @param {Object} [options]
 * @param {HTMLElement} [options.triggerElement] - The button/element that opens the dialog. Focus returns here on close.
 * @param {HTMLElement} [options.backdropElement] - An optional backdrop element. Clicking it closes the dialog.
 * @param {HTMLElement} [options.titleElement] - The element containing the dialog title (for aria-labelledby).
 * @param {HTMLElement} [options.descriptionElement] - The element containing the dialog description (for aria-describedby).
 * @param {boolean} [options.closeOnBackdropClick=true] - Whether clicking outside the dialog closes it.
 * @param {boolean} [options.closeOnEscape=true] - Whether pressing Escape closes the dialog.
 * @param {boolean} [options.lockScroll=true] - Whether to prevent body scrolling when the dialog is open.
 * @param {Function} [options.onOpen] - Callback when the dialog opens.
 * @param {Function} [options.onClose] - Callback when the dialog closes.
 * @returns {Object} Dialog controller with open(), close(), destroy(), and isOpen() methods.
 */
export function createDialog(dialogElement, options = {}) {
  const {
    triggerElement = null,
    backdropElement = null,
    titleElement = null,
    descriptionElement = null,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    lockScroll = true,
    onOpen = null,
    onClose = null,
  } = options;

  let isOpen = false;
  let previouslyFocusedElement = null;
  let previousOverflow = '';

  // Set up ARIA attributes on the dialog element.
  dialogElement.setAttribute('role', 'dialog');
  dialogElement.setAttribute('aria-modal', 'true');

  if (titleElement) {
    if (!titleElement.id) {
      titleElement.id = uniqueId('uds-dialog-title');
    }
    dialogElement.setAttribute('aria-labelledby', titleElement.id);
  }

  if (descriptionElement) {
    if (!descriptionElement.id) {
      descriptionElement.id = uniqueId('uds-dialog-desc');
    }
    dialogElement.setAttribute('aria-describedby', descriptionElement.id);
  }

  // Ensure the dialog is not visible by default (consumers handle display).
  if (!dialogElement.hasAttribute('tabindex')) {
    dialogElement.setAttribute('tabindex', '-1');
  }

  // --- Event handlers ---

  function handleKeyDown(event) {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }

    if (event.key === 'Tab') {
      trapFocus(event);
    }
  }

  function trapFocus(event) {
    const focusable = getFocusableElements(dialogElement);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on the first focusable, wrap to last.
      if (document.activeElement === firstFocusable || document.activeElement === dialogElement) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if on the last focusable, wrap to first.
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function handleBackdropClick(event) {
    if (!closeOnBackdropClick) return;

    // Close if click is on the backdrop, not on the dialog itself.
    if (backdropElement && event.target === backdropElement) {
      close();
      return;
    }

    // If no explicit backdrop, close if click is outside dialog bounds.
    if (!backdropElement && !dialogElement.contains(event.target)) {
      close();
    }
  }

  // --- Public API ---

  /**
   * Open the dialog.
   *
   * Sets `aria-modal="true"`, removes the `hidden` attribute, traps focus
   * inside the dialog, locks body scroll (if configured), and moves focus
   * to the first focusable element within the dialog. If no focusable
   * element exists, the dialog container itself receives focus.
   *
   * No-op if the dialog is already open.
   */
  function open() {
    if (isOpen) return;
    isOpen = true;

    // Store the currently focused element so we can restore it on close.
    previouslyFocusedElement = document.activeElement;

    // Lock body scroll if requested.
    if (lockScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    // Show the dialog (consumer is responsible for CSS, but we set hidden state).
    dialogElement.removeAttribute('hidden');
    if (backdropElement) {
      backdropElement.removeAttribute('hidden');
    }

    // Attach event listeners.
    dialogElement.addEventListener('keydown', handleKeyDown);

    if (closeOnBackdropClick) {
      if (backdropElement) {
        backdropElement.addEventListener('click', handleBackdropClick);
      } else {
        // Use a microtask to avoid the opening click triggering immediate close.
        requestAnimationFrame(() => {
          document.addEventListener('click', handleBackdropClick);
        });
      }
    }

    // Move focus into the dialog.
    const focusable = getFocusableElements(dialogElement);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialogElement.focus();
    }

    if (typeof onOpen === 'function') {
      onOpen();
    }
  }

  /**
   * Close the dialog.
   *
   * Removes event listeners, hides the dialog (sets `hidden`), restores
   * body scroll, and returns focus to the element that was focused before
   * the dialog was opened (typically the trigger element).
   *
   * No-op if the dialog is already closed.
   */
  function close() {
    if (!isOpen) return;
    isOpen = false;

    // Remove event listeners.
    dialogElement.removeEventListener('keydown', handleKeyDown);
    if (backdropElement) {
      backdropElement.removeEventListener('click', handleBackdropClick);
    }
    document.removeEventListener('click', handleBackdropClick);

    // Hide the dialog.
    dialogElement.setAttribute('hidden', '');
    if (backdropElement) {
      backdropElement.setAttribute('hidden', '');
    }

    // Restore body scroll.
    if (lockScroll) {
      document.body.style.overflow = previousOverflow;
    }

    // Restore focus to the previously focused element.
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  /**
   * Destroy the dialog primitive.
   *
   * Closes the dialog (if open), removes all ARIA attributes that were
   * set during initialization (`role`, `aria-modal`, `aria-labelledby`,
   * `aria-describedby`), and cleans up the trigger element's
   * `aria-haspopup` and `aria-expanded` attributes. After calling
   * `destroy()`, the dialog instance should not be reused.
   */
  function destroy() {
    close();

    // Remove ARIA attributes we set.
    dialogElement.removeAttribute('role');
    dialogElement.removeAttribute('aria-modal');
    dialogElement.removeAttribute('aria-labelledby');
    dialogElement.removeAttribute('aria-describedby');

    // Detach trigger if we attached anything to it.
    if (triggerElement) {
      triggerElement.removeAttribute('aria-haspopup');
      triggerElement.removeAttribute('aria-expanded');
    }
  }

  // Set up trigger element if provided.
  if (triggerElement) {
    triggerElement.setAttribute('aria-haspopup', 'dialog');
    triggerElement.setAttribute('aria-expanded', 'false');

    triggerElement.addEventListener('click', () => {
      if (isOpen) {
        close();
      } else {
        open();
      }
      triggerElement.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Initialize as hidden.
  dialogElement.setAttribute('hidden', '');
  if (backdropElement) {
    backdropElement.setAttribute('hidden', '');
  }

  return {
    open,
    close,
    destroy,
    /**
     * Returns `true` if the dialog is currently open, `false` otherwise.
     * @returns {boolean}
     */
    isOpen: () => isOpen,
  };
}
