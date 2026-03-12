/**
 * Options for creating a dialog primitive.
 */
export interface DialogOptions {
  /** The button/element that opens the dialog. Focus returns here on close. */
  triggerElement?: HTMLElement | null;
  /** An optional backdrop element. Clicking it closes the dialog. */
  backdropElement?: HTMLElement | null;
  /** The element containing the dialog title (for aria-labelledby). */
  titleElement?: HTMLElement | null;
  /** The element containing the dialog description (for aria-describedby). */
  descriptionElement?: HTMLElement | null;
  /** Whether clicking outside the dialog closes it. Default: true. */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the dialog. Default: true. */
  closeOnEscape?: boolean;
  /** Whether to prevent body scrolling when the dialog is open. Default: true. */
  lockScroll?: boolean;
  /** Callback when the dialog opens. */
  onOpen?: () => void;
  /** Callback when the dialog closes. */
  onClose?: () => void;
}

/**
 * Dialog controller returned by createDialog.
 */
export interface DialogController {
  /** Open the dialog, trap focus, and set aria-modal. */
  open(): void;
  /** Close the dialog, restore focus, and unlock scroll. */
  close(): void;
  /** Remove all event listeners and ARIA attributes. */
  destroy(): void;
  /** Returns true if the dialog is currently open. */
  isOpen(): boolean;
}

/**
 * Create an accessible dialog primitive with focus trap, Escape to close,
 * backdrop click to close, and full ARIA support.
 */
export declare function createDialog(
  dialogElement: HTMLElement,
  options?: DialogOptions
): DialogController;
