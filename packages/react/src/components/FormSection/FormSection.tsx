import React from 'react';

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section heading (e.g. "Contact details", "Payment"). */
  title: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Heading level for the title. @default 2 */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Content (form fields) grouped under this section. */
  children?: React.ReactNode;
}

/**
 * A form section or field group: heading + optional description + spacing for grouped fields.
 * Use for consistent structure on form pages (e.g. ATS, settings, multi-step forms).
 *
 * Uses BEM class `uds-form-section` with `__title` and `__description`.
 */
export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, titleLevel = 2, className, children, ...props }, ref) => {
    const TitleTag = `h${titleLevel}` as keyof JSX.IntrinsicElements;
    const classes = ['uds-form-section', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...props}>
        <TitleTag className="uds-form-section__title">{title}</TitleTag>
        {description && <p className="uds-form-section__description">{description}</p>}
        {children && <div className="uds-form-section__fields">{children}</div>}
      </div>
    );
  },
);

FormSection.displayName = 'FormSection';
