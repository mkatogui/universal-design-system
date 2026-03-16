# Form patterns (UDS React)

Recommended patterns for forms: required vs optional, validation, errors, and structure. Use these so UDS stays the default without reverse-engineering the bundle.

---

## Required and optional fields

- **Required:** Set `required` on `Input` (or native `required`). The component shows an asterisk (`*`) on the label and sets `aria-required`.
- **Optional:** Set `optional` on `Input`. The component shows "Optional" in the helper area (or use `optionalLabel` to override, e.g. for i18n). Do not set `required` when using `optional`.

```tsx
<Input label="Email" type="email" required />
<Input label="Phone" optional optionalLabel="Optional" />
```

---

## Input type vs multiline

- Use **`type`** for the native input kind: `'text' | 'email' | 'password' | 'number' | 'search'`.
- Use **`multiline`** for a `<textarea>`.
- **Input:** Use `type` ('text' | 'email' | 'password' | 'number' | 'search') for the native input kind, and `multiline` for `<textarea>`.

```tsx
<Input label="Email" type="email" />
<Input label="Bio" multiline />
```

---

## Validation and errors

- **Input:** Pass `errorText` to show an error below the field and set `aria-invalid`. Use `helperText` for non-error hint text.
- **FileUpload:** Pass `error` to show a message below the zone (e.g. from parent validation). The component also sets an internal error for size/count validation; the `error` prop overrides that when set.

```tsx
<Input label="Email" type="email" errorText={errors.email} />
<FileUpload error={errors.resume} placeholderTitle="Upload your resume" />
```

---

## Form structure: FormSection

Use **`FormSection`** for a heading + optional description + grouped fields so form pages stay consistent.

```tsx
<Form>
  <FormSection title="Contact" description="We'll use this to reach you.">
    <Input label="Email" type="email" required />
    <Input label="Phone" optional />
  </FormSection>
  <FormSection title="Resume">
    <FileUpload
      placeholderTitle="Drag and drop your resume"
      placeholderDescription="PDF, max 5MB"
      accept=".pdf"
    />
  </FormSection>
</Form>
```

Props: `title`, `description?`, `titleLevel?` (1–6, default 2), `children`.

---

## Public BEM and CSS (form-related)

Use these class names only for overrides or when composing; prefer props when possible.

| Component    | Block              | Elements / modifiers |
|-------------|--------------------|-----------------------|
| Input       | `uds-input`        | `__label`, `__required`, `__field`, `__helper`, `__error`; `--sm`, `--md`, `--lg`, `--error` |
| FileUpload  | `uds-file-upload`  | `__zone`, `__input`, `__placeholder`, `__text`, `__sub`, `__error`, `__list`, `__file`, `__file-name`, `__file-remove`; `--dropzone`, `--button`, `--avatar-upload`, `--sm`, `--md`, `--lg`, `--drag-over`, `--disabled` |
| FormSection | `uds-form-section` | `__title`, `__description`, `__fields` |
| Form        | `uds-form`         | (block only) |

Custom properties used by these components (tokens): `--font-sans`, `--font-size-base`, `--font-size-sm`, `--space-2`, `--space-4`, `--space-6`, `--color-text-primary`, `--color-text-secondary`, `--color-border-input`, `--color-brand-primary`, `--radius-md`, `--color-bg-primary`. See the token reference for the full set.
