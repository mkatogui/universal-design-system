/**
 * Combobox Primitive
 *
 * Accessible combobox (autocomplete/typeahead) with keyboard navigation,
 * ARIA attributes, and listbox management.
 *
 * Implements:
 * - role="combobox" on the input
 * - role="listbox" on the options container
 * - role="option" on each option
 * - aria-expanded on the input
 * - aria-activedescendant for virtual focus on options
 * - aria-autocomplete="list"
 * - Arrow key navigation (Up/Down) through options
 * - Enter to select the active option
 * - Escape to close the listbox
 * - Home/End to jump to first/last option
 * - Typeahead filtering via the input value
 *
 * @module @mkatogui/uds-primitives/combobox
 */

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Create an accessible combobox primitive.
 *
 * @param {HTMLElement} inputElement - The text input element (role="combobox" will be set).
 * @param {HTMLElement} listboxElement - The container for options (role="listbox" will be set).
 * @param {Object} [options]
 * @param {Function} [options.onSelect] - Called with the selected option element when an option is chosen.
 * @param {Function} [options.onFilter] - Called with the current input value when filtering should occur.
 *   The consumer is responsible for showing/hiding option elements. If not provided, basic
 *   textContent matching is used.
 * @param {Function} [options.onOpen] - Called when the listbox opens.
 * @param {Function} [options.onClose] - Called when the listbox closes.
 * @param {boolean} [options.autoSelect=false] - If true, the first matching option is automatically
 *   highlighted as the user types.
 * @param {string} [options.optionSelector='[role="option"]'] - CSS selector for option elements.
 * @returns {Object} Combobox controller.
 */
export function createCombobox(inputElement, listboxElement, options = {}) {
  const {
    onSelect = null,
    onFilter = null,
    onOpen = null,
    onClose = null,
    autoSelect = false,
    optionSelector = '[role="option"]',
  } = options;

  let isOpen = false;
  let activeIndex = -1;

  // Generate IDs for ARIA linking.
  const listboxId = listboxElement.id || uniqueId('uds-combobox-listbox');
  listboxElement.id = listboxId;

  // Set up ARIA on the input.
  inputElement.setAttribute('role', 'combobox');
  inputElement.setAttribute('aria-autocomplete', 'list');
  inputElement.setAttribute('aria-expanded', 'false');
  inputElement.setAttribute('aria-controls', listboxId);
  inputElement.removeAttribute('aria-activedescendant');

  // Set up ARIA on the listbox.
  listboxElement.setAttribute('role', 'listbox');

  // --- Helpers ---

  function getOptions() {
    return Array.from(listboxElement.querySelectorAll(optionSelector)).filter(
      (opt) => !opt.hasAttribute('hidden') && opt.getAttribute('aria-disabled') !== 'true'
    );
  }

  function setActiveOption(index) {
    const opts = getOptions();

    // Clear previous active.
    if (activeIndex >= 0 && activeIndex < opts.length) {
      opts[activeIndex].removeAttribute('aria-selected');
      opts[activeIndex].classList.remove('uds-combobox-active');
    }

    activeIndex = index;

    if (activeIndex >= 0 && activeIndex < opts.length) {
      const activeOpt = opts[activeIndex];

      // Ensure the option has an ID for aria-activedescendant.
      if (!activeOpt.id) {
        activeOpt.id = uniqueId('uds-combobox-option');
      }

      activeOpt.setAttribute('aria-selected', 'true');
      activeOpt.classList.add('uds-combobox-active');
      inputElement.setAttribute('aria-activedescendant', activeOpt.id);

      // Scroll into view if needed.
      activeOpt.scrollIntoView({ block: 'nearest' });
    } else {
      inputElement.removeAttribute('aria-activedescendant');
    }
  }

  function clearActive() {
    const opts = getOptions();
    opts.forEach((opt) => {
      opt.removeAttribute('aria-selected');
      opt.classList.remove('uds-combobox-active');
    });
    activeIndex = -1;
    inputElement.removeAttribute('aria-activedescendant');
  }

  // --- Open / Close ---

  function open() {
    if (isOpen) return;
    isOpen = true;
    inputElement.setAttribute('aria-expanded', 'true');
    listboxElement.removeAttribute('hidden');

    if (typeof onOpen === 'function') {
      onOpen();
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    inputElement.setAttribute('aria-expanded', 'false');
    listboxElement.setAttribute('hidden', '');
    clearActive();

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  // --- Filtering ---

  function applyFilter(value) {
    if (typeof onFilter === 'function') {
      onFilter(value);
    } else {
      // Default: hide options whose textContent does not contain the value.
      const allOptions = Array.from(listboxElement.querySelectorAll(optionSelector));
      const query = value.toLowerCase();

      allOptions.forEach((opt) => {
        const text = opt.textContent.toLowerCase();
        if (query === '' || text.includes(query)) {
          opt.removeAttribute('hidden');
        } else {
          opt.setAttribute('hidden', '');
        }
      });
    }
  }

  function selectOption(optionElement) {
    if (!optionElement) return;

    const value = optionElement.getAttribute('data-value') || optionElement.textContent;
    inputElement.value = optionElement.textContent.trim();
    close();

    if (typeof onSelect === 'function') {
      onSelect(optionElement, value);
    }
  }

  // --- Event handlers ---

  function handleInput() {
    const value = inputElement.value;
    applyFilter(value);

    if (!isOpen) {
      open();
    }

    if (autoSelect) {
      const opts = getOptions();
      if (opts.length > 0) {
        setActiveOption(0);
      } else {
        clearActive();
      }
    } else {
      clearActive();
    }
  }

  function handleKeyDown(event) {
    const opts = getOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          open();
        }
        if (opts.length > 0) {
          const nextIndex = activeIndex < opts.length - 1 ? activeIndex + 1 : 0;
          setActiveOption(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          open();
        }
        if (opts.length > 0) {
          const prevIndex = activeIndex > 0 ? activeIndex - 1 : opts.length - 1;
          setActiveOption(prevIndex);
        }
        break;

      case 'Home':
        if (isOpen && opts.length > 0) {
          event.preventDefault();
          setActiveOption(0);
        }
        break;

      case 'End':
        if (isOpen && opts.length > 0) {
          event.preventDefault();
          setActiveOption(opts.length - 1);
        }
        break;

      case 'Enter':
        if (isOpen && activeIndex >= 0 && activeIndex < opts.length) {
          event.preventDefault();
          selectOption(opts[activeIndex]);
        }
        break;

      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;

      default:
        break;
    }
  }

  function handleFocus() {
    // Optionally open on focus if there is a value.
    if (inputElement.value.length > 0) {
      applyFilter(inputElement.value);
      open();
    }
  }

  function handleBlur(event) {
    // Close the listbox when focus leaves the combobox entirely.
    // Use a timeout to allow click events on options to fire first.
    setTimeout(() => {
      if (
        !inputElement.contains(document.activeElement) &&
        !listboxElement.contains(document.activeElement)
      ) {
        close();
      }
    }, 150);
  }

  function handleOptionClick(event) {
    const option = event.target.closest(optionSelector);
    if (option && listboxElement.contains(option)) {
      event.preventDefault();
      selectOption(option);
    }
  }

  function handleOptionPointerMove(event) {
    const option = event.target.closest(optionSelector);
    if (option && listboxElement.contains(option)) {
      const opts = getOptions();
      const index = opts.indexOf(option);
      if (index !== -1 && index !== activeIndex) {
        setActiveOption(index);
      }
    }
  }

  // --- Attach listeners ---

  inputElement.addEventListener('input', handleInput);
  inputElement.addEventListener('keydown', handleKeyDown);
  inputElement.addEventListener('focus', handleFocus);
  inputElement.addEventListener('blur', handleBlur);
  listboxElement.addEventListener('click', handleOptionClick);
  listboxElement.addEventListener('pointermove', handleOptionPointerMove);

  // Ensure all existing options have role="option".
  Array.from(listboxElement.querySelectorAll(optionSelector)).forEach((opt) => {
    if (!opt.getAttribute('role')) {
      opt.setAttribute('role', 'option');
    }
  });

  // Initialize as closed.
  listboxElement.setAttribute('hidden', '');

  // --- Public API ---

  function destroy() {
    close();
    inputElement.removeEventListener('input', handleInput);
    inputElement.removeEventListener('keydown', handleKeyDown);
    inputElement.removeEventListener('focus', handleFocus);
    inputElement.removeEventListener('blur', handleBlur);
    listboxElement.removeEventListener('click', handleOptionClick);
    listboxElement.removeEventListener('pointermove', handleOptionPointerMove);

    inputElement.removeAttribute('role');
    inputElement.removeAttribute('aria-autocomplete');
    inputElement.removeAttribute('aria-expanded');
    inputElement.removeAttribute('aria-controls');
    inputElement.removeAttribute('aria-activedescendant');
    listboxElement.removeAttribute('role');
  }

  return {
    open,
    close,
    destroy,
    isOpen: () => isOpen,
    getActiveOption: () => {
      const opts = getOptions();
      return activeIndex >= 0 && activeIndex < opts.length ? opts[activeIndex] : null;
    },
    setOptions: (filterFn) => {
      if (typeof filterFn === 'function') {
        filterFn();
      }
      if (autoSelect) {
        const opts = getOptions();
        if (opts.length > 0) {
          setActiveOption(0);
        }
      }
    },
  };
}
