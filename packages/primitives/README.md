# @mkatogui/uds-primitives

Unstyled, accessible component primitives for the Universal Design System.

Framework-agnostic headless components that handle the 5 hardest accessibility patterns: **Dialog**, **Combobox**, **Tabs**, **Menu**, and **Tooltip**. Zero CSS, zero visual opinions -- just correct keyboard navigation, focus management, and ARIA attributes.

Works with vanilla JavaScript, React refs, Vue refs, Svelte actions, or any DOM-based framework.

## Installation

```bash
npm install @mkatogui/uds-primitives
```

## Primitives

### Dialog

Modal dialog with focus trap, Escape to close, backdrop click to close, scroll lock, and focus restoration.

**Accessibility features:**
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to the dialog title
- Focus trap: Tab/Shift+Tab cycle within the dialog
- Focus restoration: returns focus to the trigger element on close
- Escape key to close
- Backdrop click to close (configurable)
- Body scroll lock when open (configurable)

```html
<button id="trigger">Open Dialog</button>
<div id="backdrop"></div>
<div id="dialog">
  <h2 id="dialog-title">Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <button id="confirm">Confirm</button>
  <button id="cancel">Cancel</button>
</div>
```

```js
import { createDialog } from '@mkatogui/uds-primitives/dialog';

const dialog = createDialog(document.getElementById('dialog'), {
  triggerElement: document.getElementById('trigger'),
  backdropElement: document.getElementById('backdrop'),
  titleElement: document.getElementById('dialog-title'),
  closeOnEscape: true,
  closeOnBackdropClick: true,
  lockScroll: true,
  onOpen: () => console.log('opened'),
  onClose: () => console.log('closed'),
});

// Programmatic control
dialog.open();
dialog.close();
dialog.isOpen(); // boolean

// Cleanup
dialog.destroy();
```

---

### Combobox

Autocomplete/typeahead input with keyboard navigation, filtering, and virtual focus via `aria-activedescendant`.

**Accessibility features:**
- `role="combobox"` on the input, `role="listbox"` on options container
- `role="option"` on each option
- `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`
- `aria-activedescendant` for virtual focus (no actual DOM focus change on options)
- Arrow key navigation (Up/Down) through visible options
- Home/End to jump to first/last option
- Enter to select the active option
- Escape to close the listbox
- Default text filtering or custom filter function

```html
<input id="search" type="text" />
<ul id="listbox">
  <li role="option">Apple</li>
  <li role="option">Banana</li>
  <li role="option">Cherry</li>
  <li role="option">Date</li>
</ul>
```

```js
import { createCombobox } from '@mkatogui/uds-primitives/combobox';

const combobox = createCombobox(
  document.getElementById('search'),
  document.getElementById('listbox'),
  {
    autoSelect: true,
    onSelect: (optionEl, value) => {
      console.log('Selected:', value);
    },
    onFilter: (query) => {
      // Custom filtering logic (optional -- default uses textContent matching)
    },
  }
);

combobox.open();
combobox.close();
combobox.getActiveOption(); // HTMLElement | null
combobox.destroy();
```

---

### Tabs

Tabbed interface with roving tabindex, arrow key navigation, and automatic or manual activation.

**Accessibility features:**
- `role="tablist"` on the container, `role="tab"` on triggers, `role="tabpanel"` on panels
- `aria-selected` on the active tab
- `aria-controls` and `aria-labelledby` linking tabs to panels
- Roving tabindex: only the active tab is in the Tab order
- Left/Right arrow keys for horizontal, Up/Down for vertical
- Home/End to jump to first/last tab
- Automatic mode: arrow keys both focus and activate
- Manual mode: arrow keys move focus, Enter/Space activates

```html
<div id="tablist">
  <button role="tab">Tab 1</button>
  <button role="tab">Tab 2</button>
  <button role="tab">Tab 3</button>
</div>
<div>
  <div role="tabpanel">Content for Tab 1</div>
  <div role="tabpanel">Content for Tab 2</div>
  <div role="tabpanel">Content for Tab 3</div>
</div>
```

```js
import { createTabs } from '@mkatogui/uds-primitives/tabs';

const tabs = createTabs(document.getElementById('tablist'), {
  orientation: 'horizontal', // or 'vertical'
  activation: 'automatic',   // or 'manual'
  defaultIndex: 0,
  onChange: (tab, panel, index) => {
    console.log('Active tab:', index);
  },
});

tabs.activateTab(2);         // Switch to the third tab
tabs.getActiveIndex();       // number
tabs.getActiveTab();         // HTMLElement | null
tabs.getActivePanel();       // HTMLElement | null
tabs.refresh();              // Re-link after DOM changes
tabs.destroy();
```

---

### Menu

Dropdown menu with keyboard navigation, first-letter jumping, and focus management.

**Accessibility features:**
- `role="menu"` on the container, `role="menuitem"` on each item
- `aria-haspopup="true"` and `aria-expanded` on the trigger button
- Arrow key navigation (Up/Down) with wrapping
- Home/End to jump to first/last item
- First-letter navigation: typing a character jumps to the next matching item
- Multi-character buffered search (500ms timeout)
- Enter/Space to activate the focused item
- Escape to close and return focus to the trigger
- Clicking outside closes the menu

```html
<button id="menu-trigger">Actions</button>
<div id="menu">
  <button role="menuitem">Edit</button>
  <button role="menuitem">Duplicate</button>
  <button role="menuitem">Delete</button>
</div>
```

```js
import { createMenu } from '@mkatogui/uds-primitives/menu';

const menu = createMenu(
  document.getElementById('menu-trigger'),
  document.getElementById('menu'),
  {
    closeOnSelect: true,
    onSelect: (item) => {
      console.log('Selected:', item.textContent);
    },
    onOpen: () => console.log('menu opened'),
    onClose: () => console.log('menu closed'),
  }
);

menu.open();
menu.close();
menu.toggle();
menu.isOpen();   // boolean
menu.refresh();  // Re-init items after DOM changes
menu.destroy();
```

---

### Tooltip

Informational tooltip that shows on hover and focus, with configurable delay and Escape to dismiss.

**Accessibility features:**
- `role="tooltip"` on the tooltip element
- `aria-describedby` on the trigger, linking to the tooltip
- Shows on `mouseenter` (with 300ms delay) and on `focusin` (immediately)
- Hides on `mouseleave`, `focusout`, and Escape key
- Pointer can move over the tooltip without dismissing it
- Does NOT trap focus -- tooltips are purely informational

```html
<button id="btn">Save</button>
<span id="tip">Save your changes (Ctrl+S)</span>
```

```js
import { createTooltip } from '@mkatogui/uds-primitives/tooltip';

const tooltip = createTooltip(
  document.getElementById('btn'),
  document.getElementById('tip'),
  {
    showDelay: 300,
    hideDelay: 0,
    onShow: () => console.log('tooltip visible'),
    onHide: () => console.log('tooltip hidden'),
  }
);

tooltip.show();       // Show immediately (no delay)
tooltip.hide();       // Hide immediately
tooltip.isVisible();  // boolean
tooltip.destroy();
```

## Importing

Import all primitives at once:

```js
import { createDialog, createCombobox, createTabs, createMenu, createTooltip } from '@mkatogui/uds-primitives';
```

Or import individually for tree-shaking:

```js
import { createDialog } from '@mkatogui/uds-primitives/dialog';
import { createCombobox } from '@mkatogui/uds-primitives/combobox';
import { createTabs } from '@mkatogui/uds-primitives/tabs';
import { createMenu } from '@mkatogui/uds-primitives/menu';
import { createTooltip } from '@mkatogui/uds-primitives/tooltip';
```

## Design Principles

1. **Zero CSS** -- These primitives add no styles. You bring your own design system, Tailwind classes, or CSS-in-JS.

2. **Framework-agnostic** -- Pure DOM manipulation. Works with vanilla JS, React refs, Vue template refs, Svelte `bind:this`, Web Components, or any other framework.

3. **Correct by default** -- ARIA attributes, keyboard navigation, and focus management follow WAI-ARIA Authoring Practices 1.2. Each primitive handles the edge cases that are easy to get wrong.

4. **Destroyable** -- Every primitive returns a `destroy()` method that removes all event listeners and ARIA attributes, preventing memory leaks in SPA frameworks.

5. **Minimal API surface** -- Each primitive takes a DOM element and an options object. No build step, no dependencies, no runtime framework.

## License

MIT
