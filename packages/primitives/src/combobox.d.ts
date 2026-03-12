/**
 * Options for creating a combobox primitive.
 */
export interface ComboboxOptions {
  /** Called with the selected option element and its value when an option is chosen. */
  onSelect?: (optionElement: HTMLElement, value: string) => void;
  /** Called with the current input value when filtering should occur. */
  onFilter?: (value: string) => void;
  /** Called when the listbox opens. */
  onOpen?: () => void;
  /** Called when the listbox closes. */
  onClose?: () => void;
  /** If true, the first matching option is highlighted as the user types. Default: false. */
  autoSelect?: boolean;
  /** CSS selector for option elements. Default: '[role="option"]'. */
  optionSelector?: string;
}

/**
 * Combobox controller returned by createCombobox.
 */
export interface ComboboxController {
  /** Open the listbox. */
  open(): void;
  /** Close the listbox and clear active descendant. */
  close(): void;
  /** Remove all event listeners and ARIA attributes. */
  destroy(): void;
  /** Returns true if the listbox is currently open. */
  isOpen(): boolean;
  /** Returns the currently highlighted option element, or null. */
  getActiveOption(): HTMLElement | null;
  /** Run an external function to update options, then re-highlight if autoSelect is on. */
  setOptions(filterFn: () => void): void;
}

/**
 * Create an accessible combobox primitive with typeahead, keyboard navigation,
 * and full ARIA support.
 */
export declare function createCombobox(
  inputElement: HTMLInputElement,
  listboxElement: HTMLElement,
  options?: ComboboxOptions
): ComboboxController;
