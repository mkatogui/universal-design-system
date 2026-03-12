/**
 * Tooltip Primitive
 *
 * Accessible tooltip that shows on hover and focus, hides on Escape,
 * with configurable delays and full ARIA support.
 *
 * Implements:
 * - role="tooltip" on the tooltip element
 * - aria-describedby on the trigger, pointing to the tooltip
 * - Show on mouseenter and focusin on the trigger
 * - Hide on mouseleave, focusout, and Escape
 * - Configurable show delay (default 300ms) for hover
 * - Immediate hide (no delay)
 * - Does NOT trap focus — tooltip is purely informational
 * - Touch support: show on long press (optional)
 *
 * @module @mkatogui/uds-primitives/tooltip
 */

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Create an accessible tooltip primitive.
 *
 * @param {HTMLElement} triggerElement - The element that triggers the tooltip (button, link, etc.).
 * @param {HTMLElement} tooltipElement - The element that serves as the tooltip content.
 * @param {Object} [options]
 * @param {number} [options.showDelay=300] - Delay in ms before showing the tooltip on hover.
 * @param {number} [options.hideDelay=0] - Delay in ms before hiding the tooltip.
 * @param {Function} [options.onShow] - Called when the tooltip becomes visible.
 * @param {Function} [options.onHide] - Called when the tooltip is hidden.
 * @returns {Object} Tooltip controller.
 */
export function createTooltip(triggerElement, tooltipElement, options = {}) {
  const {
    showDelay = 300,
    hideDelay = 0,
    onShow = null,
    onHide = null,
  } = options;

  let isVisible = false;
  let showTimeout = null;
  let hideTimeout = null;

  // Generate an ID for the tooltip if it does not have one.
  const tooltipId = tooltipElement.id || uniqueId('uds-tooltip');
  tooltipElement.id = tooltipId;

  // Set ARIA attributes.
  tooltipElement.setAttribute('role', 'tooltip');
  triggerElement.setAttribute('aria-describedby', tooltipId);

  // Ensure the tooltip is hidden initially.
  tooltipElement.setAttribute('hidden', '');

  // --- Show / Hide ---

  /**
   * Show the tooltip after the configured `showDelay`.
   *
   * Cancels any pending hide timeout, then waits `showDelay`
   * milliseconds before removing the `hidden` attribute from the
   * tooltip element and firing the `onShow` callback.
   *
   * No-op if the tooltip is already visible.
   */
  function show() {
    clearTimeout(hideTimeout);
    clearTimeout(showTimeout);

    showTimeout = setTimeout(() => {
      if (isVisible) return;
      isVisible = true;

      tooltipElement.removeAttribute('hidden');

      if (typeof onShow === 'function') {
        onShow();
      }
    }, showDelay);
  }

  /**
   * Show the tooltip immediately (no delay).
   *
   * Used for keyboard focus so keyboard users do not have to wait.
   * Cancels any pending timeouts and makes the tooltip visible right
   * away by removing the `hidden` attribute.
   *
   * No-op if the tooltip is already visible.
   */
  function showImmediate() {
    clearTimeout(hideTimeout);
    clearTimeout(showTimeout);

    if (isVisible) return;
    isVisible = true;

    tooltipElement.removeAttribute('hidden');

    if (typeof onShow === 'function') {
      onShow();
    }
  }

  /**
   * Hide the tooltip.
   *
   * Cancels any pending show timeout. If `hideDelay` is greater than
   * zero, waits that many milliseconds before hiding; otherwise hides
   * immediately by setting the `hidden` attribute and firing the
   * `onHide` callback.
   *
   * No-op if the tooltip is already hidden.
   */
  function hide() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);

    if (hideDelay > 0) {
      hideTimeout = setTimeout(() => {
        doHide();
      }, hideDelay);
    } else {
      doHide();
    }
  }

  function doHide() {
    if (!isVisible) return;
    isVisible = false;

    tooltipElement.setAttribute('hidden', '');

    if (typeof onHide === 'function') {
      onHide();
    }
  }

  // --- Event handlers ---

  function handleMouseEnter() {
    show();
  }

  function handleMouseLeave() {
    hide();
  }

  function handleFocusIn() {
    // Show immediately on focus (keyboard users should not have to wait).
    showImmediate();
  }

  function handleFocusOut() {
    hide();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && isVisible) {
      event.preventDefault();
      hide();
    }
  }

  // Prevent tooltip from closing when the pointer moves over the tooltip itself.
  function handleTooltipMouseEnter() {
    clearTimeout(hideTimeout);
  }

  function handleTooltipMouseLeave() {
    hide();
  }

  // --- Attach listeners ---

  triggerElement.addEventListener('mouseenter', handleMouseEnter);
  triggerElement.addEventListener('mouseleave', handleMouseLeave);
  triggerElement.addEventListener('focusin', handleFocusIn);
  triggerElement.addEventListener('focusout', handleFocusOut);
  triggerElement.addEventListener('keydown', handleKeyDown);

  tooltipElement.addEventListener('mouseenter', handleTooltipMouseEnter);
  tooltipElement.addEventListener('mouseleave', handleTooltipMouseLeave);

  // --- Public API ---

  /**
   * Destroy the tooltip primitive.
   *
   * Clears all pending timeouts, hides the tooltip (if visible),
   * removes all event listeners from both the trigger and tooltip
   * elements, and removes the ARIA attributes (`aria-describedby`
   * on the trigger, `role` and `hidden` on the tooltip). After
   * calling `destroy()`, the tooltip instance should not be reused.
   */
  function destroy() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);

    if (isVisible) {
      doHide();
    }

    triggerElement.removeEventListener('mouseenter', handleMouseEnter);
    triggerElement.removeEventListener('mouseleave', handleMouseLeave);
    triggerElement.removeEventListener('focusin', handleFocusIn);
    triggerElement.removeEventListener('focusout', handleFocusOut);
    triggerElement.removeEventListener('keydown', handleKeyDown);
    tooltipElement.removeEventListener('mouseenter', handleTooltipMouseEnter);
    tooltipElement.removeEventListener('mouseleave', handleTooltipMouseLeave);

    triggerElement.removeAttribute('aria-describedby');
    tooltipElement.removeAttribute('role');
    tooltipElement.removeAttribute('hidden');
  }

  return {
    /** Show the tooltip immediately (bypasses `showDelay`). */
    show: showImmediate,
    hide,
    destroy,
    /**
     * Returns `true` if the tooltip is currently visible, `false` otherwise.
     * @returns {boolean}
     */
    isVisible: () => isVisible,
  };
}
