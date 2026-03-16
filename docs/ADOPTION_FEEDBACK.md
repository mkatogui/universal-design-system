# Adoption feedback

Feedback from using UDS as the default in a real application (e.g. ATS/product apps). Use this to prioritize API clarity, docs, and component coverage.

---

## Implemented (summary)

| # | Area | What was done |
|---|------|----------------|
| 1 | API consistency | **Input:** Use `type` and `multiline` only; `variant` removed. **FileUpload:** `error` prop added to public API. |
| 2 | FileUpload customization | **FileUpload:** Added `placeholderTitle`, `placeholderDescription`, `acceptLabel` so apps can customize without replacing `children`. |
| 3 | Required/optional | **Input:** Added `optional` and `optionalLabel`; component renders "Optional" in helper area when `optional` is true. |
| 4 | Docs | **Form patterns:** Added `docs/FORM_PATTERNS.md` (required vs optional, validation, errors, FormSection, public BEM/CSS for form components). |
| 5 | Theming | (Audit for token-only styling and per-component token list left as future work.) |
| 6 | Tree-shaking | Package already uses named ESM exports and `sideEffects: ["**/*.css"]` so bundlers can tree-shake JS. |
| 7 | Component coverage | **FormSection:** New component (title + optional description + `__fields` wrapper) for consistent form pages. |

---

## 1. API consistency

**Issue (resolved):** Input previously used `variant` for both semantic type and control shape. It now uses `type` ('text' | 'email' | 'password' | 'number' | 'search') and `multiline` for `<textarea>` only.

**Issue:** `FileUpload` appears to support an error state in the rendered UI (e.g. `uds-file-upload__error`), but the public TypeScript props do not include `error`. So either the API is incomplete or the feature is internal only — either way it's confusing for adopters.

**Suggestions (implemented):**

- Input now uses `type` and `multiline` only; `variant` has been removed.
- `error` (and placeholder props) are documented and exposed on `FileUpload` in the public API and types.

---

## 2. FileUpload customization

**Issue:** The dropzone ships with a single default placeholder ("Drag and drop files here, or click to browse"). To show a custom message, accept types, or icon you have to replace the whole `children` and style them with your own classes (e.g. `uds-file-upload__title`, `uds-file-upload__sub`) that are not part of the official API. So "customization" is "replace the default and reimplement the look with BEM-like names," which is brittle and not documented as a supported pattern.

**Suggestion:** Support a simple slot/prop API, e.g. `placeholderTitle`, `placeholderDescription`, `acceptLabel`, or a single placeholder slot, so apps don't have to override the entire content to stay on-brand.

---

## 3. Required / optional semantics

**Issue:** `Input` has `required` and shows an asterisk, but there's no first-class way to express "optional" in the API. So apps use `helperText="Optional"` and every app does the same. That's a very common pattern and could be built in.

**Suggestion:** Add something like `optional` or `required={false}` with explicit semantics, and optionally render "Optional" (or a localized string) from the component so label + helper stay consistent and accessible.

---

## 4. Docs vs implementation

**Issue:** Understanding components often required reading the built CSS (e.g. `components.css`) and the `.d.ts` files. The fact that we had to fix "required asterisk hidden" and "optional in label" suggests the intended patterns (required indicator, optional fields) aren't clearly documented or exemplified.

**Suggestion:** Document recommended form patterns (required vs optional, validation, errors) and list all public CSS custom properties and BEM modifiers so adopters don't have to reverse-engineer the bundle.

---

## 5. Theming and tokens

**Issue:** Palettes are switched via `data-theme`, which is good. It's less clear whether every component only uses tokens (no hardcoded colors) and whether the token set is complete (e.g. for focus rings, disabled states, or high contrast). If a few values are hardcoded, themes will look inconsistent.

**Suggestion:** Audit components for token-only styling and document the full token set (and which tokens each component uses) so theming is predictable.

---

## 6. Bundle and tree-shaking

**Issue:** With 43 components in one package there's a risk of pulling more than needed if the build isn't tree-shakeable (e.g. single default export or heavy side effects).

**Suggestion:** Publish with clear ESM entry points and no side effects so bundlers can drop unused components and keep UDS as the default without paying for the whole library.

---

## 7. Component coverage

**Issue:** UDS has a rich set (DataTable, Modal, Tabs, etc.). For an ATS we needed a "form section" or "field group" (heading + optional description + grouped fields). That might be a small layout component or a documented pattern; without it, every app builds its own and drifts.

**Suggestion:** Add a small `FieldGroup` or `FormSection` (title + optional description + spacing) so form pages are consistent and UDS remains the default for structure as well as controls.

---

## Summary

| Area | Main criticism |
|------|----------------|
| **API** | Input now uses `type` + `multiline`; FileUpload `error` and placeholder props are public. |
| **FileUpload** | Not easily customizable without replacing content and mimicking internal class names. |
| **Forms** | No built-in "optional" semantics and no clear, documented form patterns. |
| **Docs** | Docs don't yet make it easy to adopt UDS as the default without reading built CSS and types. |

Addressing these would make UDS easier to adopt as the default in production applications.
