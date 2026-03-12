/**
 * Primitives Test Suite
 *
 * Tests for the headless, accessibility-first UI primitives:
 * Dialog, Combobox, Tabs, Menu, and Tooltip.
 *
 * Uses Node.js built-in test runner (node:test) with a lightweight DOM mock.
 * No external dependencies required (no jsdom, no test frameworks).
 *
 * Run: node --test tests/components/primitives.test.js
 */

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

// ---------------------------------------------------------------------------
// Minimal DOM Mock
// ---------------------------------------------------------------------------
// A lightweight, JSDOM-free DOM mock that supports the APIs used by the
// primitives: attributes, children, events, focus, classList, and
// querySelectorAll. This avoids any dependency on jsdom while still being
// sufficient for testing headless primitives.
// ---------------------------------------------------------------------------

let activeElement = null;

class MockClassList {
  constructor() {
    this._classes = new Set();
  }
  add(cls) {
    this._classes.add(cls);
  }
  remove(cls) {
    this._classes.delete(cls);
  }
  contains(cls) {
    return this._classes.has(cls);
  }
  toggle(cls) {
    if (this._classes.has(cls)) {
      this._classes.delete(cls);
    } else {
      this._classes.add(cls);
    }
  }
}

class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
    this.key = options.key || '';
    this.shiftKey = options.shiftKey || false;
    this.ctrlKey = options.ctrlKey || false;
    this.metaKey = options.metaKey || false;
    this.altKey = options.altKey || false;
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.target = null;
  }
  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
  stopPropagation() {
    this.propagationStopped = true;
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.nodeName = this.tagName;
    this.nodeType = 1;
    this._attributes = {};
    this._children = [];
    this._parent = null;
    this._listeners = {};
    this.classList = new MockClassList();
    this.id = '';
    this.textContent = '';
    this.type = '';
    this.value = '';
    this.style = {};

    // For offsetParent checks in dialog's getFocusableElements.
    this.offsetParent = {}; // truthy = visible
  }

  getAttribute(name) {
    if (name === 'id') return this.id || null;
    return Object.hasOwn(this._attributes, name) ? this._attributes[name] : null;
  }

  setAttribute(name, value) {
    if (name === 'id') {
      this.id = value;
    }
    this._attributes[name] = String(value);
  }

  removeAttribute(name) {
    if (name === 'id') {
      this.id = '';
    }
    delete this._attributes[name];
  }

  hasAttribute(name) {
    if (name === 'id') return !!this.id;
    return Object.hasOwn(this._attributes, name);
  }

  appendChild(child) {
    child._parent = this;
    this._children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this._children.indexOf(child);
    if (idx !== -1) {
      this._children.splice(idx, 1);
      child._parent = null;
    }
    return child;
  }

  get parentElement() {
    return this._parent;
  }

  contains(el) {
    if (el === this) return true;
    for (const child of this._children) {
      if (child.contains(el)) return true;
    }
    return false;
  }

  closest(selector) {
    // Minimal: support role-based selectors like '[role="option"]'.
    let el = this;
    while (el) {
      if (matchesSelector(el, selector)) return el;
      el = el._parent;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    collectMatching(this, selector, results);
    return results;
  }

  addEventListener(type, fn) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter((f) => f !== fn);
  }

  dispatchEvent(event) {
    event.target = event.target || this;

    // Fire listeners on this element.
    const listeners = this._listeners[event.type] || [];
    for (const fn of [...listeners]) {
      fn(event);
    }

    // Bubble up.
    if (event.bubbles && !event.propagationStopped && this._parent) {
      this._parent.dispatchEvent(event);
    }

    return !event.defaultPrevented;
  }

  focus() {
    activeElement = this;
  }

  blur() {
    if (activeElement === this) {
      activeElement = mockDocument.body;
    }
  }

  click() {
    if (this._clicking) return; // Prevent re-entrant clicks.
    this._clicking = true;
    const event = new MockEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
    this._clicking = false;
  }

  scrollIntoView() {
    // No-op in mock.
  }
}

function matchesSelector(el, selector) {
  // Support: tagName, [attr], [attr="value"], .class, combined selectors.
  // This is minimal and handles the selectors used by the primitives.
  const parts = selector.split(',').map((s) => s.trim());
  return parts.some((part) => matchesSingleSelector(el, part));
}

function matchesSingleSelector(el, selector) {
  // Handle selectors like: button, [role="tab"], [role="option"],
  // a[href], input:not([disabled]):not([type="hidden"]), etc.
  // For simplicity, handle the most common patterns.

  // Handle tag selectors.
  if (/^[a-zA-Z]+$/.test(selector)) {
    return el.tagName === selector.toUpperCase();
  }

  // Handle [attr="value"] selectors.
  const attrMatch = selector.match(/^\[([a-zA-Z-]+)(?:="([^"]*)")?\]$/);
  if (attrMatch) {
    const [, attr, value] = attrMatch;
    if (value !== undefined) {
      return el.getAttribute(attr) === value;
    }
    return el.hasAttribute(attr);
  }

  // Handle compound selectors: tag[attr], tag:not(...)
  // For our tests, we primarily need [role="X"] selectors.
  // Handle: tag[attr="value"]
  const compoundMatch = selector.match(/^([a-zA-Z]+)\[([a-zA-Z-]+)(?:="([^"]*)")?\]$/);
  if (compoundMatch) {
    const [, tag, attr, value] = compoundMatch;
    if (el.tagName !== tag.toUpperCase()) return false;
    if (value !== undefined) return el.getAttribute(attr) === value;
    return el.hasAttribute(attr);
  }

  // Handle complex selectors like input:not([disabled]):not([type="hidden"]) etc.
  // For button:not([disabled]), [tabindex]:not([tabindex="-1"]), etc.
  const notMatch = selector.match(/^(.+?):not\(\[([a-zA-Z-]+)(?:="([^"]*)")?\]\)(.*)$/);
  if (notMatch) {
    const [, base, attr, value, rest] = notMatch;
    // First check the base part.
    if (!matchesSingleSelector(el, base)) return false;
    // Then check the :not condition.
    if (value !== undefined) {
      if (el.getAttribute(attr) === value) return false;
    } else {
      if (el.hasAttribute(attr)) return false;
    }
    // Handle chained :not selectors.
    if (rest?.startsWith(':not(')) {
      return matchesSingleSelector(el, base + rest);
    }
    return true;
  }

  // Handle details > summary:first-of-type (skip, not used in tests).
  // Handle [contenteditable]:not([contenteditable="false"]) - covered by :not above.
  // Handle audio[controls], video[controls] - covered by tag[attr] above.

  return false;
}

function collectMatching(el, selector, results) {
  for (const child of el._children) {
    if (matchesSelector(child, selector)) {
      results.push(child);
    }
    collectMatching(child, selector, results);
  }
}

// Mock document.
const mockDocument = {
  body: new MockElement('body'),
  _listeners: {},
  get activeElement() {
    return activeElement || this.body;
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  addEventListener(type, fn) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(fn);
  },
  removeEventListener(type, fn) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter((f) => f !== fn);
  },
  dispatchEvent(event) {
    const listeners = this._listeners[event.type] || [];
    for (const fn of [...listeners]) {
      fn(event);
    }
  },
};

// ---------------------------------------------------------------------------
// Global setup: wire mock DOM into globalThis.
// ---------------------------------------------------------------------------

function setupGlobals() {
  activeElement = mockDocument.body;
  mockDocument.body._children = [];
  mockDocument.body._listeners = {};
  mockDocument._listeners = {};
  mockDocument.body.style = {};

  globalThis.document = mockDocument;
  globalThis.window = { KeyboardEvent: MockEvent, MouseEvent: MockEvent, FocusEvent: MockEvent };
  globalThis.HTMLElement = MockElement;
  globalThis.getComputedStyle = () => ({ position: 'static' });
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  globalThis.setTimeout = globalThis.setTimeout; // ensure available
  globalThis.clearTimeout = globalThis.clearTimeout;
}

function teardownGlobals() {
  globalThis.document = undefined;
  globalThis.window = undefined;
  globalThis.HTMLElement = undefined;
  globalThis.getComputedStyle = undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pressKey(element, key, opts = {}) {
  const event = new MockEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...opts,
  });
  element.dispatchEvent(event);
  return event;
}

function focusElement(element) {
  element.focus();
  const event = new MockEvent('focusin', { bubbles: true });
  element.dispatchEvent(event);
}

function blurElement(element) {
  const event = new MockEvent('focusout', { bubbles: true });
  element.dispatchEvent(event);
  element.blur();
}

function mouseEnter(element) {
  const event = new MockEvent('mouseenter', { bubbles: false });
  element.dispatchEvent(event);
}

function mouseLeave(element) {
  const event = new MockEvent('mouseleave', { bubbles: false });
  element.dispatchEvent(event);
}

// ============================================================================
// Dialog Tests
// ============================================================================

describe('Dialog Primitive', () => {
  let createDialog;

  beforeEach(async () => {
    setupGlobals();
    // Dynamic import to pick up fresh global state.
    const mod = await import(
      `../../packages/primitives/src/dialog.js?v=${Date.now()}_${Math.random()}`
    );
    createDialog = mod.createDialog;
  });

  afterEach(() => {
    teardownGlobals();
  });

  it('sets role="dialog" and aria-modal="true" on initialization', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);

    createDialog(dialog);

    assert.equal(dialog.getAttribute('role'), 'dialog');
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
  });

  it('sets aria-labelledby pointing to the title element', () => {
    const dialog = mockDocument.createElement('div');
    const title = mockDocument.createElement('h2');
    title.textContent = 'Dialog Title';
    dialog.appendChild(title);
    mockDocument.body.appendChild(dialog);

    createDialog(dialog, { titleElement: title });

    const labelledBy = dialog.getAttribute('aria-labelledby');
    assert.ok(labelledBy, 'aria-labelledby should be set');
    assert.equal(title.id, labelledBy, 'aria-labelledby should point to title element ID');
  });

  it('sets aria-describedby pointing to the description element', () => {
    const dialog = mockDocument.createElement('div');
    const desc = mockDocument.createElement('p');
    desc.textContent = 'Dialog description';
    dialog.appendChild(desc);
    mockDocument.body.appendChild(dialog);

    createDialog(dialog, { descriptionElement: desc });

    const describedBy = dialog.getAttribute('aria-describedby');
    assert.ok(describedBy, 'aria-describedby should be set');
    assert.equal(desc.id, describedBy, 'aria-describedby should point to description element ID');
  });

  it('starts hidden and opens with open()', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog);
    assert.equal(dialog.hasAttribute('hidden'), true, 'dialog should start hidden');
    assert.equal(ctrl.isOpen(), false);

    ctrl.open();
    assert.equal(dialog.hasAttribute('hidden'), false, 'dialog should not be hidden after open');
    assert.equal(ctrl.isOpen(), true);
  });

  it('closes with close() and restores hidden attribute', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog);
    ctrl.open();
    ctrl.close();

    assert.equal(dialog.hasAttribute('hidden'), true, 'dialog should be hidden after close');
    assert.equal(ctrl.isOpen(), false);
  });

  it('closes on Escape key press', () => {
    const dialog = mockDocument.createElement('div');
    const button = mockDocument.createElement('button');
    button.textContent = 'Focusable';
    dialog.appendChild(button);
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog, { closeOnEscape: true, lockScroll: false });
    ctrl.open();
    assert.equal(ctrl.isOpen(), true);

    pressKey(dialog, 'Escape');
    assert.equal(ctrl.isOpen(), false, 'dialog should close on Escape');
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog, { closeOnEscape: false, lockScroll: false });
    ctrl.open();

    pressKey(dialog, 'Escape');
    assert.equal(ctrl.isOpen(), true, 'dialog should remain open when closeOnEscape is false');
  });

  it('traps focus: Tab on last focusable wraps to first', () => {
    const dialog = mockDocument.createElement('div');
    const btn1 = mockDocument.createElement('button');
    btn1.textContent = 'First';
    const btn2 = mockDocument.createElement('button');
    btn2.textContent = 'Second';
    const btn3 = mockDocument.createElement('button');
    btn3.textContent = 'Third';
    dialog.appendChild(btn1);
    dialog.appendChild(btn2);
    dialog.appendChild(btn3);
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog, { lockScroll: false });
    ctrl.open();

    // Focus the last button.
    btn3.focus();

    // Tab from last button should be prevented (focus trap wraps).
    const event = pressKey(dialog, 'Tab');
    assert.equal(
      event.defaultPrevented,
      true,
      'Tab on last element should be prevented (focus trap)',
    );
  });

  it('traps focus: Shift+Tab on first focusable wraps to last', () => {
    const dialog = mockDocument.createElement('div');
    const btn1 = mockDocument.createElement('button');
    btn1.textContent = 'First';
    const btn2 = mockDocument.createElement('button');
    btn2.textContent = 'Second';
    dialog.appendChild(btn1);
    dialog.appendChild(btn2);
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog, { lockScroll: false });
    ctrl.open();

    // Focus the first button.
    btn1.focus();

    // Shift+Tab from first button should be prevented.
    const event = pressKey(dialog, 'Tab', { shiftKey: true });
    assert.equal(
      event.defaultPrevented,
      true,
      'Shift+Tab on first element should be prevented (focus trap)',
    );
  });

  it('fires onOpen and onClose callbacks', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);

    let opened = false;
    let closed = false;

    const ctrl = createDialog(dialog, {
      lockScroll: false,
      onOpen: () => {
        opened = true;
      },
      onClose: () => {
        closed = true;
      },
    });

    ctrl.open();
    assert.equal(opened, true, 'onOpen callback should fire');

    ctrl.close();
    assert.equal(closed, true, 'onClose callback should fire');
  });

  it('locks and restores body scroll', () => {
    const dialog = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);
    mockDocument.body.style.overflow = '';

    const ctrl = createDialog(dialog, { lockScroll: true });
    ctrl.open();
    assert.equal(mockDocument.body.style.overflow, 'hidden', 'body scroll should be locked');

    ctrl.close();
    assert.equal(mockDocument.body.style.overflow, '', 'body scroll should be restored');
  });

  it('destroy() removes all ARIA attributes', () => {
    const dialog = mockDocument.createElement('div');
    const title = mockDocument.createElement('h2');
    dialog.appendChild(title);
    mockDocument.body.appendChild(dialog);

    const ctrl = createDialog(dialog, { titleElement: title });
    ctrl.destroy();

    assert.equal(dialog.hasAttribute('role'), false);
    assert.equal(dialog.hasAttribute('aria-modal'), false);
    assert.equal(dialog.hasAttribute('aria-labelledby'), false);
  });

  it('shows/hides backdrop element', () => {
    const dialog = mockDocument.createElement('div');
    const backdrop = mockDocument.createElement('div');
    mockDocument.body.appendChild(dialog);
    mockDocument.body.appendChild(backdrop);

    const ctrl = createDialog(dialog, { backdropElement: backdrop, lockScroll: false });

    assert.equal(backdrop.hasAttribute('hidden'), true, 'backdrop should start hidden');

    ctrl.open();
    assert.equal(backdrop.hasAttribute('hidden'), false, 'backdrop should be visible when open');

    ctrl.close();
    assert.equal(backdrop.hasAttribute('hidden'), true, 'backdrop should be hidden after close');
  });
});

// ============================================================================
// Combobox Tests
// ============================================================================

describe('Combobox Primitive', () => {
  let createCombobox;

  beforeEach(async () => {
    setupGlobals();
    const mod = await import(
      `../../packages/primitives/src/combobox.js?v=${Date.now()}_${Math.random()}`
    );
    createCombobox = mod.createCombobox;
  });

  afterEach(() => {
    teardownGlobals();
  });

  function buildCombobox() {
    const input = mockDocument.createElement('input');
    input.type = 'text';
    const listbox = mockDocument.createElement('ul');

    const opt1 = mockDocument.createElement('li');
    opt1.setAttribute('role', 'option');
    opt1.textContent = 'Apple';
    const opt2 = mockDocument.createElement('li');
    opt2.setAttribute('role', 'option');
    opt2.textContent = 'Banana';
    const opt3 = mockDocument.createElement('li');
    opt3.setAttribute('role', 'option');
    opt3.textContent = 'Cherry';

    listbox.appendChild(opt1);
    listbox.appendChild(opt2);
    listbox.appendChild(opt3);

    mockDocument.body.appendChild(input);
    mockDocument.body.appendChild(listbox);

    return { input, listbox, options: [opt1, opt2, opt3] };
  }

  it('sets correct ARIA attributes on initialization', () => {
    const { input, listbox } = buildCombobox();
    createCombobox(input, listbox);

    assert.equal(input.getAttribute('role'), 'combobox');
    assert.equal(input.getAttribute('aria-autocomplete'), 'list');
    assert.equal(input.getAttribute('aria-expanded'), 'false');
    assert.ok(input.getAttribute('aria-controls'), 'aria-controls should be set');
    assert.equal(listbox.getAttribute('role'), 'listbox');
  });

  it('starts with listbox hidden', () => {
    const { input, listbox } = buildCombobox();
    createCombobox(input, listbox);

    assert.equal(listbox.hasAttribute('hidden'), true);
  });

  it('aria-expanded toggles on open/close', () => {
    const { input, listbox } = buildCombobox();
    const ctrl = createCombobox(input, listbox);

    assert.equal(input.getAttribute('aria-expanded'), 'false');

    ctrl.open();
    assert.equal(input.getAttribute('aria-expanded'), 'true');

    ctrl.close();
    assert.equal(input.getAttribute('aria-expanded'), 'false');
  });

  it('ArrowDown navigates through options', () => {
    const { input, listbox, options } = buildCombobox();
    createCombobox(input, listbox);

    // ArrowDown opens the listbox and moves to the first option.
    pressKey(input, 'ArrowDown');

    assert.equal(options[0].getAttribute('aria-selected'), 'true');
    assert.ok(input.getAttribute('aria-activedescendant'), 'aria-activedescendant should be set');

    // ArrowDown again to move to second option.
    pressKey(input, 'ArrowDown');
    assert.equal(options[1].getAttribute('aria-selected'), 'true');
    assert.equal(
      options[0].hasAttribute('aria-selected'),
      false,
      'previous option should be deselected',
    );
  });

  it('ArrowUp navigates backward through options', () => {
    const { input, listbox, options } = buildCombobox();
    createCombobox(input, listbox);

    // Move to first option.
    pressKey(input, 'ArrowDown');
    assert.equal(options[0].getAttribute('aria-selected'), 'true');

    // ArrowUp wraps to last option.
    pressKey(input, 'ArrowUp');
    assert.equal(options[2].getAttribute('aria-selected'), 'true');
  });

  it('Enter selects the active option', () => {
    const { input, listbox, options } = buildCombobox();
    let selected = null;
    const ctrl = createCombobox(input, listbox, {
      onSelect: (el) => {
        selected = el;
      },
    });

    // Navigate to first option and select.
    pressKey(input, 'ArrowDown');
    pressKey(input, 'Enter');

    assert.equal(selected, options[0], 'onSelect should be called with the first option');
    assert.equal(input.value, 'Apple', 'input value should be set to option text');
    assert.equal(ctrl.isOpen(), false, 'listbox should close after selection');
  });

  it('Escape closes the listbox', () => {
    const { input, listbox } = buildCombobox();
    const ctrl = createCombobox(input, listbox);

    ctrl.open();
    assert.equal(ctrl.isOpen(), true);

    pressKey(input, 'Escape');
    assert.equal(ctrl.isOpen(), false);
    assert.equal(input.getAttribute('aria-expanded'), 'false');
  });

  it('aria-activedescendant updates when navigating', () => {
    const { input, listbox, options } = buildCombobox();
    createCombobox(input, listbox);

    // Open and navigate.
    pressKey(input, 'ArrowDown');
    const id0 = input.getAttribute('aria-activedescendant');
    assert.ok(id0, 'aria-activedescendant should be set after ArrowDown');
    assert.equal(id0, options[0].id, 'should point to first option');

    pressKey(input, 'ArrowDown');
    const id1 = input.getAttribute('aria-activedescendant');
    assert.equal(id1, options[1].id, 'should point to second option');
  });

  it('clears aria-activedescendant on close', () => {
    const { input, listbox } = buildCombobox();
    const ctrl = createCombobox(input, listbox);

    ctrl.open();
    pressKey(input, 'ArrowDown');
    assert.ok(input.getAttribute('aria-activedescendant'));

    ctrl.close();
    assert.equal(
      input.hasAttribute('aria-activedescendant'),
      false,
      'aria-activedescendant should be removed on close',
    );
  });

  it('getActiveOption() returns the highlighted option', () => {
    const { input, listbox, options } = buildCombobox();
    const ctrl = createCombobox(input, listbox);

    assert.equal(ctrl.getActiveOption(), null, 'no active option initially');

    pressKey(input, 'ArrowDown');
    assert.equal(ctrl.getActiveOption(), options[0]);

    pressKey(input, 'ArrowDown');
    assert.equal(ctrl.getActiveOption(), options[1]);
  });

  it('destroy() removes all ARIA attributes', () => {
    const { input, listbox } = buildCombobox();
    const ctrl = createCombobox(input, listbox);

    ctrl.destroy();

    assert.equal(input.hasAttribute('role'), false);
    assert.equal(input.hasAttribute('aria-autocomplete'), false);
    assert.equal(input.hasAttribute('aria-expanded'), false);
    assert.equal(input.hasAttribute('aria-controls'), false);
    assert.equal(listbox.hasAttribute('role'), false);
  });
});

// ============================================================================
// Tabs Tests
// ============================================================================

describe('Tabs Primitive', () => {
  let createTabs;

  beforeEach(async () => {
    setupGlobals();
    const mod = await import(
      `../../packages/primitives/src/tabs.js?v=${Date.now()}_${Math.random()}`
    );
    createTabs = mod.createTabs;
  });

  afterEach(() => {
    teardownGlobals();
  });

  function buildTabs() {
    const container = mockDocument.createElement('div');

    const tablist = mockDocument.createElement('div');
    const tab1 = mockDocument.createElement('button');
    tab1.setAttribute('role', 'tab');
    tab1.textContent = 'Tab 1';
    const tab2 = mockDocument.createElement('button');
    tab2.setAttribute('role', 'tab');
    tab2.textContent = 'Tab 2';
    const tab3 = mockDocument.createElement('button');
    tab3.setAttribute('role', 'tab');
    tab3.textContent = 'Tab 3';

    tablist.appendChild(tab1);
    tablist.appendChild(tab2);
    tablist.appendChild(tab3);

    const panel1 = mockDocument.createElement('div');
    panel1.setAttribute('role', 'tabpanel');
    panel1.textContent = 'Panel 1 content';
    const panel2 = mockDocument.createElement('div');
    panel2.setAttribute('role', 'tabpanel');
    panel2.textContent = 'Panel 2 content';
    const panel3 = mockDocument.createElement('div');
    panel3.setAttribute('role', 'tabpanel');
    panel3.textContent = 'Panel 3 content';

    container.appendChild(tablist);
    container.appendChild(panel1);
    container.appendChild(panel2);
    container.appendChild(panel3);

    mockDocument.body.appendChild(container);

    return {
      container,
      tablist,
      tabs: [tab1, tab2, tab3],
      panels: [panel1, panel2, panel3],
    };
  }

  it('sets role="tablist" on the container', () => {
    const { tablist } = buildTabs();
    createTabs(tablist);

    assert.equal(tablist.getAttribute('role'), 'tablist');
  });

  it('sets aria-selected="true" on the active tab (default index 0)', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist);

    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[1].getAttribute('aria-selected'), 'false');
    assert.equal(tabs[2].getAttribute('aria-selected'), 'false');
  });

  it('uses roving tabindex: only active tab has tabindex="0"', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist);

    assert.equal(tabs[0].getAttribute('tabindex'), '0');
    assert.equal(tabs[1].getAttribute('tabindex'), '-1');
    assert.equal(tabs[2].getAttribute('tabindex'), '-1');
  });

  it('shows only the active panel, hides the rest', () => {
    const { tablist, panels } = buildTabs();
    createTabs(tablist);

    assert.equal(panels[0].hasAttribute('hidden'), false, 'first panel should be visible');
    assert.equal(panels[1].hasAttribute('hidden'), true, 'second panel should be hidden');
    assert.equal(panels[2].hasAttribute('hidden'), true, 'third panel should be hidden');
  });

  it('links tabs to panels with aria-controls and aria-labelledby', () => {
    const { tablist, tabs, panels } = buildTabs();
    createTabs(tablist);

    tabs.forEach((tab, i) => {
      const controlsId = tab.getAttribute('aria-controls');
      assert.ok(controlsId, `tab ${i} should have aria-controls`);
      assert.equal(controlsId, panels[i].id, `tab ${i} aria-controls should match panel ${i} id`);

      const labelledBy = panels[i].getAttribute('aria-labelledby');
      assert.ok(labelledBy, `panel ${i} should have aria-labelledby`);
      assert.equal(labelledBy, tab.id, `panel ${i} aria-labelledby should match tab ${i} id`);
    });
  });

  it('ArrowRight activates the next tab (automatic activation)', () => {
    const { tablist, tabs, panels } = buildTabs();
    createTabs(tablist, { activation: 'automatic' });

    tabs[0].focus();
    pressKey(tablist, 'ArrowRight');

    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[0].getAttribute('aria-selected'), 'false');
    assert.equal(panels[1].hasAttribute('hidden'), false, 'second panel should be visible');
    assert.equal(panels[0].hasAttribute('hidden'), true, 'first panel should be hidden');
  });

  it('ArrowLeft activates the previous tab', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist, { activation: 'automatic', defaultIndex: 1 });

    tabs[1].focus();
    pressKey(tablist, 'ArrowLeft');

    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[1].getAttribute('aria-selected'), 'false');
  });

  it('ArrowRight wraps from last to first tab', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist, { activation: 'automatic', defaultIndex: 2 });

    tabs[2].focus();
    pressKey(tablist, 'ArrowRight');

    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  });

  it('ArrowLeft wraps from first to last tab', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist, { activation: 'automatic', defaultIndex: 0 });

    tabs[0].focus();
    pressKey(tablist, 'ArrowLeft');

    assert.equal(tabs[2].getAttribute('aria-selected'), 'true');
  });

  it('Home key jumps to the first tab', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist, { activation: 'automatic', defaultIndex: 2 });

    tabs[2].focus();
    pressKey(tablist, 'Home');

    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  });

  it('End key jumps to the last tab', () => {
    const { tablist, tabs } = buildTabs();
    createTabs(tablist, { activation: 'automatic', defaultIndex: 0 });

    tabs[0].focus();
    pressKey(tablist, 'End');

    assert.equal(tabs[2].getAttribute('aria-selected'), 'true');
  });

  it('manual activation: ArrowRight moves focus but does not activate', () => {
    const { tablist, tabs, panels } = buildTabs();
    createTabs(tablist, { activation: 'manual' });

    tabs[0].focus();
    pressKey(tablist, 'ArrowRight');

    // Tab 0 should still be the active (selected) tab.
    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(panels[0].hasAttribute('hidden'), false);
  });

  it('manual activation: Enter activates the focused tab', () => {
    const { tablist, tabs, panels } = buildTabs();
    createTabs(tablist, { activation: 'manual' });

    // Move focus to tab 1.
    tabs[1].focus();
    pressKey(tablist, 'Enter');

    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(panels[1].hasAttribute('hidden'), false);
  });

  it('manual activation: Space activates the focused tab', () => {
    const { tablist, tabs, panels } = buildTabs();
    createTabs(tablist, { activation: 'manual' });

    tabs[1].focus();
    pressKey(tablist, ' ');

    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(panels[1].hasAttribute('hidden'), false);
  });

  it('activateTab() programmatically switches tabs', () => {
    const { tablist, tabs, panels } = buildTabs();
    const ctrl = createTabs(tablist);

    ctrl.activateTab(2);

    assert.equal(tabs[2].getAttribute('aria-selected'), 'true');
    assert.equal(panels[2].hasAttribute('hidden'), false);
    assert.equal(ctrl.getActiveIndex(), 2);
  });

  it('getActiveTab() and getActivePanel() return correct elements', () => {
    const { tablist, tabs, panels } = buildTabs();
    const ctrl = createTabs(tablist, { defaultIndex: 1 });

    assert.equal(ctrl.getActiveTab(), tabs[1]);
    assert.equal(ctrl.getActivePanel(), panels[1]);
  });

  it('onChange callback fires on tab change', () => {
    const { tablist, tabs, panels } = buildTabs();
    let calledWith = null;
    createTabs(tablist, {
      defaultIndex: 0,
      onChange: (tab, panel, index) => {
        calledWith = { tab, panel, index };
      },
    });

    tabs[0].focus();
    pressKey(tablist, 'ArrowRight');

    assert.ok(calledWith, 'onChange should have been called');
    assert.equal(calledWith.tab, tabs[1]);
    assert.equal(calledWith.panel, panels[1]);
    assert.equal(calledWith.index, 1);
  });

  it('destroy() removes all ARIA attributes', () => {
    const { tablist, tabs, panels } = buildTabs();
    const ctrl = createTabs(tablist);

    ctrl.destroy();

    assert.equal(tablist.hasAttribute('role'), false);
    assert.equal(tablist.hasAttribute('aria-orientation'), false);

    tabs.forEach((tab) => {
      assert.equal(tab.hasAttribute('aria-selected'), false);
      assert.equal(tab.hasAttribute('tabindex'), false);
      assert.equal(tab.hasAttribute('aria-controls'), false);
    });

    panels.forEach((panel) => {
      assert.equal(panel.hasAttribute('aria-labelledby'), false);
      assert.equal(panel.hasAttribute('hidden'), false);
    });
  });
});

// ============================================================================
// Menu Tests
// ============================================================================

describe('Menu Primitive', () => {
  let createMenu;

  beforeEach(async () => {
    setupGlobals();
    const mod = await import(
      `../../packages/primitives/src/menu.js?v=${Date.now()}_${Math.random()}`
    );
    createMenu = mod.createMenu;
  });

  afterEach(() => {
    teardownGlobals();
  });

  function buildMenu() {
    const trigger = mockDocument.createElement('button');
    trigger.textContent = 'Menu';
    const menu = mockDocument.createElement('ul');

    const item1 = mockDocument.createElement('li');
    item1.setAttribute('role', 'menuitem');
    item1.textContent = 'Cut';
    const item2 = mockDocument.createElement('li');
    item2.setAttribute('role', 'menuitem');
    item2.textContent = 'Copy';
    const item3 = mockDocument.createElement('li');
    item3.setAttribute('role', 'menuitem');
    item3.textContent = 'Paste';

    menu.appendChild(item1);
    menu.appendChild(item2);
    menu.appendChild(item3);

    mockDocument.body.appendChild(trigger);
    mockDocument.body.appendChild(menu);

    return { trigger, menu, items: [item1, item2, item3] };
  }

  it('sets role="menu" on the menu element', () => {
    const { trigger, menu } = buildMenu();
    createMenu(trigger, menu);

    assert.equal(menu.getAttribute('role'), 'menu');
  });

  it('sets role="menuitem" on each item', () => {
    const { trigger, menu, items } = buildMenu();
    createMenu(trigger, menu);

    items.forEach((item) => {
      assert.equal(item.getAttribute('role'), 'menuitem');
    });
  });

  it('sets aria-haspopup="true" and aria-expanded="false" on the trigger', () => {
    const { trigger, menu } = buildMenu();
    createMenu(trigger, menu);

    assert.equal(trigger.getAttribute('aria-haspopup'), 'true');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  });

  it('aria-expanded toggles on open/close', () => {
    const { trigger, menu } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    assert.equal(trigger.getAttribute('aria-expanded'), 'false');

    ctrl.open();
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');

    ctrl.close();
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  });

  it('starts with menu hidden', () => {
    const { trigger, menu } = buildMenu();
    createMenu(trigger, menu);

    assert.equal(menu.hasAttribute('hidden'), true);
  });

  it('opens on trigger click', () => {
    const { trigger, menu } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    trigger.click();
    assert.equal(ctrl.isOpen(), true);
    assert.equal(menu.hasAttribute('hidden'), false);
  });

  it('ArrowDown navigates through menu items', () => {
    const { trigger, menu, items } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();
    // First item should have tabindex="0" on open.
    assert.equal(items[0].getAttribute('tabindex'), '0');

    // ArrowDown to next item.
    pressKey(menu, 'ArrowDown');
    assert.equal(items[1].getAttribute('tabindex'), '0');
    assert.equal(items[0].getAttribute('tabindex'), '-1');
  });

  it('ArrowUp navigates backward through menu items', () => {
    const { trigger, menu, items } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();

    // ArrowUp from first item wraps to last.
    pressKey(menu, 'ArrowUp');
    assert.equal(items[2].getAttribute('tabindex'), '0');
  });

  it('ArrowDown wraps from last to first item', () => {
    const { trigger, menu, items } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();

    // Navigate to last item.
    pressKey(menu, 'ArrowDown');
    pressKey(menu, 'ArrowDown');

    // Wrap to first.
    pressKey(menu, 'ArrowDown');
    assert.equal(items[0].getAttribute('tabindex'), '0');
  });

  it('Enter activates the focused menu item', () => {
    const { trigger, menu, items } = buildMenu();
    let selected = null;
    const ctrl = createMenu(trigger, menu, {
      onSelect: (item) => {
        selected = item;
      },
    });

    ctrl.open();
    pressKey(menu, 'Enter');
    assert.equal(selected, items[0], 'onSelect should be called with the first item');
  });

  it('Space activates the focused menu item', () => {
    const { trigger, menu, items } = buildMenu();
    let selected = null;
    const ctrl = createMenu(trigger, menu, {
      onSelect: (item) => {
        selected = item;
      },
    });

    ctrl.open();
    pressKey(menu, 'ArrowDown');

    pressKey(menu, ' ');
    assert.equal(selected, items[1], 'onSelect should be called with the second item');
  });

  it('Escape closes the menu', () => {
    const { trigger, menu } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();
    assert.equal(ctrl.isOpen(), true);

    pressKey(menu, 'Escape');
    assert.equal(ctrl.isOpen(), false);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  });

  it('Home key jumps to the first item', () => {
    const { trigger, menu, items } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();
    pressKey(menu, 'End');
    assert.equal(items[2].getAttribute('tabindex'), '0');

    pressKey(menu, 'Home');
    assert.equal(items[0].getAttribute('tabindex'), '0');
  });

  it('End key jumps to the last item', () => {
    const { trigger, menu, items } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.open();
    pressKey(menu, 'End');
    assert.equal(items[2].getAttribute('tabindex'), '0');
  });

  it('toggle() switches menu state', () => {
    const { trigger, menu } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.toggle();
    assert.equal(ctrl.isOpen(), true);

    ctrl.toggle();
    assert.equal(ctrl.isOpen(), false);
  });

  it('fires onOpen and onClose callbacks', () => {
    const { trigger, menu } = buildMenu();
    let opened = false;
    let closed = false;

    const ctrl = createMenu(trigger, menu, {
      onOpen: () => {
        opened = true;
      },
      onClose: () => {
        closed = true;
      },
    });

    ctrl.open();
    assert.equal(opened, true);

    ctrl.close();
    assert.equal(closed, true);
  });

  it('destroy() removes all ARIA attributes', () => {
    const { trigger, menu } = buildMenu();
    const ctrl = createMenu(trigger, menu);

    ctrl.destroy();

    assert.equal(trigger.hasAttribute('aria-haspopup'), false);
    assert.equal(trigger.hasAttribute('aria-expanded'), false);
    assert.equal(trigger.hasAttribute('aria-controls'), false);
    assert.equal(menu.hasAttribute('role'), false);
    assert.equal(menu.hasAttribute('hidden'), false);
  });
});

// ============================================================================
// Tooltip Tests
// ============================================================================

describe('Tooltip Primitive', () => {
  let createTooltip;

  beforeEach(async () => {
    setupGlobals();
    const mod = await import(
      `../../packages/primitives/src/tooltip.js?v=${Date.now()}_${Math.random()}`
    );
    createTooltip = mod.createTooltip;
  });

  afterEach(() => {
    teardownGlobals();
  });

  function buildTooltip() {
    const trigger = mockDocument.createElement('button');
    trigger.textContent = 'Hover me';
    const tooltip = mockDocument.createElement('div');
    tooltip.textContent = 'Tooltip content';

    mockDocument.body.appendChild(trigger);
    mockDocument.body.appendChild(tooltip);

    return { trigger, tooltip };
  }

  it('sets role="tooltip" on the tooltip element', () => {
    const { trigger, tooltip } = buildTooltip();
    createTooltip(trigger, tooltip);

    assert.equal(tooltip.getAttribute('role'), 'tooltip');
  });

  it('sets aria-describedby on the trigger pointing to the tooltip', () => {
    const { trigger, tooltip } = buildTooltip();
    createTooltip(trigger, tooltip);

    const describedBy = trigger.getAttribute('aria-describedby');
    assert.ok(describedBy, 'aria-describedby should be set');
    assert.equal(describedBy, tooltip.id, 'aria-describedby should point to tooltip ID');
  });

  it('starts hidden', () => {
    const { trigger, tooltip } = buildTooltip();
    createTooltip(trigger, tooltip);

    assert.equal(tooltip.hasAttribute('hidden'), true);
  });

  it('shows on focusin (immediate, no delay)', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip, { showDelay: 300 });

    focusElement(trigger);

    assert.equal(ctrl.isVisible(), true, 'tooltip should be visible after focus');
    assert.equal(tooltip.hasAttribute('hidden'), false);
  });

  it('hides on focusout', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip, { showDelay: 0, hideDelay: 0 });

    focusElement(trigger);
    assert.equal(ctrl.isVisible(), true);

    blurElement(trigger);
    assert.equal(ctrl.isVisible(), false);
    assert.equal(tooltip.hasAttribute('hidden'), true);
  });

  it('shows on mouseenter (after delay)', async () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip, { showDelay: 10 });

    mouseEnter(trigger);

    // Before delay, should not be visible.
    assert.equal(ctrl.isVisible(), false);

    // Wait for the delay.
    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(ctrl.isVisible(), true, 'tooltip should be visible after delay');
    assert.equal(tooltip.hasAttribute('hidden'), false);
  });

  it('hides on mouseleave', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip, { showDelay: 0, hideDelay: 0 });

    ctrl.show();
    assert.equal(ctrl.isVisible(), true);

    mouseLeave(trigger);
    assert.equal(ctrl.isVisible(), false);
  });

  it('hides on Escape key press', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip, { showDelay: 0 });

    ctrl.show();
    assert.equal(ctrl.isVisible(), true);

    pressKey(trigger, 'Escape');
    assert.equal(ctrl.isVisible(), false, 'tooltip should hide on Escape');
    assert.equal(tooltip.hasAttribute('hidden'), true);
  });

  it('show() and hide() work as public API', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip);

    ctrl.show();
    assert.equal(ctrl.isVisible(), true);
    assert.equal(tooltip.hasAttribute('hidden'), false);

    ctrl.hide();
    assert.equal(ctrl.isVisible(), false);
    assert.equal(tooltip.hasAttribute('hidden'), true);
  });

  it('fires onShow and onHide callbacks', () => {
    const { trigger, tooltip } = buildTooltip();
    let shown = false;
    let hidden = false;

    const ctrl = createTooltip(trigger, tooltip, {
      showDelay: 0,
      hideDelay: 0,
      onShow: () => {
        shown = true;
      },
      onHide: () => {
        hidden = true;
      },
    });

    ctrl.show();
    assert.equal(shown, true, 'onShow should fire');

    ctrl.hide();
    assert.equal(hidden, true, 'onHide should fire');
  });

  it('destroy() removes all ARIA attributes', () => {
    const { trigger, tooltip } = buildTooltip();
    const ctrl = createTooltip(trigger, tooltip);

    ctrl.destroy();

    assert.equal(trigger.hasAttribute('aria-describedby'), false);
    assert.equal(tooltip.hasAttribute('role'), false);
    assert.equal(tooltip.hasAttribute('hidden'), false);
  });

  it('preserves existing tooltip ID', () => {
    const { trigger, tooltip } = buildTooltip();
    tooltip.id = 'my-custom-tooltip';

    createTooltip(trigger, tooltip);

    assert.equal(tooltip.id, 'my-custom-tooltip', 'should preserve existing ID');
    assert.equal(trigger.getAttribute('aria-describedby'), 'my-custom-tooltip');
  });
});
