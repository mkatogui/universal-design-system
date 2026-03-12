/**
 * Options for creating a tooltip primitive.
 */
export interface TooltipOptions {
  /** Delay in ms before showing the tooltip on hover. Default: 300. */
  showDelay?: number;
  /** Delay in ms before hiding the tooltip. Default: 0 (immediate). */
  hideDelay?: number;
  /** Called when the tooltip becomes visible. */
  onShow?: () => void;
  /** Called when the tooltip is hidden. */
  onHide?: () => void;
}

/**
 * Tooltip controller returned by createTooltip.
 */
export interface TooltipController {
  /** Show the tooltip immediately (no delay). */
  show(): void;
  /** Hide the tooltip. */
  hide(): void;
  /** Remove all event listeners and ARIA attributes. */
  destroy(): void;
  /** Returns true if the tooltip is currently visible. */
  isVisible(): boolean;
}

/**
 * Create an accessible tooltip primitive that shows on hover and focus,
 * hides on Escape, with configurable delays and full ARIA support.
 * Does not trap focus.
 */
export declare function createTooltip(
  triggerElement: HTMLElement,
  tooltipElement: HTMLElement,
  options?: TooltipOptions
): TooltipController;
