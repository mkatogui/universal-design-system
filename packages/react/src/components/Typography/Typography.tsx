import React from 'react';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'code';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant. @default 'body' */
  variant?: TypographyVariant;
}

const defaultTag: Record<TypographyVariant, 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'code'> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'span',
  code: 'code',
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', className, children, ...props }, ref) => {
    const Tag = defaultTag[variant];
    const classes = ['uds-typography', `uds-typography--${variant}`, className]
      .filter(Boolean)
      .join(' ');
    return React.createElement(
      Tag,
      { ref, className: classes, ...props },
      children,
    ) as React.ReactElement;
  },
);

Typography.displayName = 'Typography';
