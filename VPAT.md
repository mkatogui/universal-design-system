# Voluntary Product Accessibility Template (VPAT)

## Product Information

| Field | Value |
|---|---|
| **Product Name** | Universal Design System (UDS) |
| **Product Version** | 0.1.x |
| **Report Date** | 2026-03-12 |
| **Report Format** | VPAT 2.4 Rev (WCAG 2.1) |
| **Contact** | [GitHub Issues](https://github.com/mkatogui/universal-design-system/issues) |
| **Evaluation Methods** | Automated testing (wcag-audit.py, axe-core), manual keyboard/screen reader testing |

## Conformance Claim

The Universal Design System targets **WCAG 2.1 Level AA** conformance. The system provides design tokens, component specifications, and documentation that are designed to produce accessible output when implemented according to the documented accessibility requirements.

UDS is a design system (tokens, specifications, and reference implementations), not an end-user application. Conformance depends on correct implementation by consumers. This VPAT documents the conformance of the design system specifications and reference documentation.

---

## WCAG 2.1 Level A Criteria

### Principle 1: Perceivable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **1.1.1 Non-text Content** | Supports | All component specs require alt text for images and aria-label for icon-only controls. Decorative images use aria-hidden=true. |
| **1.2.1 Audio-only and Video-only (Prerecorded)** | Not Applicable | UDS does not include prerecorded audio or video content. The Testimonial video variant spec defers media accessibility to implementors. |
| **1.2.2 Captions (Prerecorded)** | Not Applicable | UDS does not include prerecorded media. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** | Not Applicable | UDS does not include prerecorded media. |
| **1.3.1 Info and Relationships** | Supports | All components specify semantic HTML (nav, header, footer, fieldset, table, list). ARIA roles, landmarks, and heading hierarchies are documented per component. |
| **1.3.2 Meaningful Sequence** | Supports | Component DOM order matches visual presentation order. Reading order is logical in all component layouts. |
| **1.3.3 Sensory Characteristics** | Supports | Instructions and status indicators do not rely solely on color, shape, or visual location. Alert and Badge components use text labels alongside color. |
| **1.4.1 Use of Color** | Supports | Status colors (success, warning, error, info) are always paired with text labels or icons. Form validation uses text messages, not color alone. |
| **1.4.2 Audio Control** | Not Applicable | UDS does not auto-play audio. |

### Principle 2: Operable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **2.1.1 Keyboard** | Supports | All interactive components (Button, Modal, Tabs, Accordion, Dropdown, Date Picker, Command Palette) specify full keyboard operability including Tab, Enter, Space, Arrow, and Escape keys. |
| **2.1.2 No Keyboard Trap** | Supports | Modal specifies focus trap with Escape key exit. All other components allow standard Tab navigation without trapping. |
| **2.1.4 Character Key Shortcuts** | Not Applicable | UDS does not define single-character keyboard shortcuts. Command Palette uses modifier key combinations. |
| **2.2.1 Timing Adjustable** | Partially Supports | Toast component has configurable auto-dismiss duration. However, default timing may be insufficient for some users. Implementors should ensure error/warning toasts are not auto-dismissed. |
| **2.2.2 Pause, Stop, Hide** | Supports | All animations are wrapped in @media (prefers-reduced-motion: no-preference). Loading states (Skeleton, Progress) can be paused by removing the component. |
| **2.3.1 Three Flashes or Below Threshold** | Supports | No component produces flashing content. Gradient and glow effects are static or use slow transitions. |
| **2.4.1 Bypass Blocks** | Supports | Documentation pages include skip-to-content links. Navigation Bar component is in a nav landmark. |
| **2.4.2 Page Titled** | Supports | All documentation pages have descriptive title elements. |
| **2.4.3 Focus Order** | Supports | Component tab order follows logical DOM sequence. Modal focus trap cycles through interactive elements in order. |
| **2.4.4 Link Purpose (In Context)** | Supports | Navigation, Breadcrumb, Pagination, and Footer components use descriptive link text. |
| **2.5.1 Pointer Gestures** | Supports | No component requires multipoint or path-based gestures. All interactions work with single-point activation. |
| **2.5.2 Pointer Cancellation** | Supports | Button and interactive components use click (mouseup) events, not mousedown, allowing cancellation. |
| **2.5.3 Label in Name** | Supports | Component specs require visible labels to match accessible names. Form Input, Select, Checkbox, and Radio all require label association. |
| **2.5.4 Motion Actuation** | Not Applicable | No component is actuated by device motion. |

### Principle 3: Understandable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **3.1.1 Language of Page** | Supports | All documentation pages declare lang="en" on the html element. |
| **3.2.1 On Focus** | Supports | No component initiates a change of context on focus. |
| **3.2.2 On Input** | Supports | Form components do not submit or change context on input. Toggle Switch triggers immediate effect but does not change context. |
| **3.3.1 Error Identification** | Supports | Form Input, Select, and Date Picker specify aria-invalid and error text via aria-describedby. Alert component provides error messaging. |
| **3.3.2 Labels or Instructions** | Supports | All form components require associated labels. Helper text is linked via aria-describedby. Required fields are marked with the required attribute. |

### Principle 4: Robust

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **4.1.1 Parsing** | Supports | Documentation pages use valid HTML5. Component specs produce well-formed markup. |
| **4.1.2 Name, Role, Value** | Supports | All components specify ARIA roles, names, and states. Button (role=button, aria-disabled), Modal (role=dialog, aria-modal), Tabs (role=tablist/tab/tabpanel), Toggle (role=switch, aria-checked), etc. |

---

## WCAG 2.1 Level AA Criteria

### Principle 1: Perceivable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **1.2.4 Captions (Live)** | Not Applicable | UDS does not include live media. |
| **1.2.5 Audio Description (Prerecorded)** | Not Applicable | UDS does not include prerecorded media. |
| **1.3.4 Orientation** | Supports | No component restricts display to a single orientation. All layouts are responsive. |
| **1.3.5 Identify Input Purpose** | Supports | Form Input component supports autocomplete attributes. Input types (email, tel, password) convey purpose. |
| **1.4.3 Contrast (Minimum)** | Supports | All 9 palettes validated against 4.5:1 for body text and 3.0:1 for large text. 108 automated checks across light and dark modes. See Palette Contrast Results in conformance documentation. |
| **1.4.4 Resize Text** | Supports | Typography uses clamp() with relative units. Text scales to 200% without loss of content or functionality. |
| **1.4.5 Images of Text** | Supports | UDS uses web fonts and CSS-rendered text. No images of text are used in components. |
| **1.4.10 Reflow** | Supports | All documentation pages and component layouts reflow to 320px CSS width without horizontal scrolling. |
| **1.4.11 Non-text Contrast** | Supports | UI components (buttons, inputs, toggles, checkboxes) maintain 3:1 contrast against adjacent colors. Border tokens provide sufficient contrast. |
| **1.4.12 Text Spacing** | Supports | Components use relative spacing units (em, rem) and CSS custom properties. Text spacing can be overridden without breaking layout. |
| **1.4.13 Content on Hover or Focus** | Partially Supports | Tooltip appears on hover and focus. However, the spec does not yet explicitly require Escape key dismissal or persistent display while hovered. Dropdown Menu meets this criterion fully. |

### Principle 2: Operable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **2.4.5 Multiple Ways** | Supports | Documentation provides navigation bar, table of contents, search (Command Palette), and breadcrumbs. |
| **2.4.6 Headings and Labels** | Supports | All documentation pages use hierarchical headings (h1-h3). Component specs require descriptive labels. |
| **2.4.7 Focus Visible** | Supports | All interactive components specify visible focus indicators. Button uses 2px offset focus ring. Inputs, selects, and toggles show border-color changes on focus. |

### Principle 3: Understandable

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **3.1.2 Language of Parts** | Not Applicable | UDS documentation is in a single language. Components do not define multi-language content. |
| **3.2.3 Consistent Navigation** | Supports | All documentation pages share the same site-topnav navigation bar with consistent ordering. |
| **3.2.4 Consistent Identification** | Supports | Components with the same function use consistent naming (BEM: .uds-{component}--{variant}). Tokens provide consistent visual treatment. |
| **3.3.3 Error Suggestion** | Supports | Form components support errorText prop for specific correction suggestions. |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | Partially Supports | Modal confirmation variant supports review-before-submit patterns. File Upload allows removal before final submission. Not all form workflows enforce confirmation by default. |

### Principle 4: Robust

| Criteria | Conformance Level | Remarks |
|---|---|---|
| **4.1.3 Status Messages** | Supports | Alert uses role=alert (error/warning) and role=status (success/info). Toast uses the same roles for transient messages. Progress Indicator uses role=progressbar with aria-valuenow. File Upload uses aria-live=polite for upload status. |

---

## Summary

| Conformance Level | Count |
|---|---|
| Supports | 41 |
| Partially Supports | 3 |
| Does Not Support | 0 |
| Not Applicable | 8 |

The Universal Design System substantially meets WCAG 2.1 Level AA requirements. The three "Partially Supports" items are:

1. **SC 2.2.1 Timing Adjustable** -- Toast auto-dismiss timing is configurable but defaults may be insufficient. Mitigation: document recommendation to not auto-dismiss error/warning toasts.
2. **SC 1.4.13 Content on Hover or Focus** -- Tooltip does not yet specify Escape key dismissal. Mitigation: planned for next minor release.
3. **SC 3.3.4 Error Prevention** -- Confirmation patterns are available (Modal) but not enforced by default in all form workflows. Mitigation: documented as a best practice in component guidelines.

---

## Document History

| Date | Version | Notes |
|---|---|---|
| 2026-03-12 | 1.0 | Initial VPAT based on UDS v0.1.x |
