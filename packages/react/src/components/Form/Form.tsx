import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Optional id for the form (for aria). */
  id?: string;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, id, ...props }, ref) => {
    const classes = ['uds-form', className].filter(Boolean).join(' ');
    return (
      <form ref={ref} id={id} className={classes} {...props}>
        {children}
      </form>
    );
  },
);

Form.displayName = 'Form';
