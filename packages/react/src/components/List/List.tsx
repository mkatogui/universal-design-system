import React from 'react';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: 'bullet' | 'numbered' | 'none';
  dense?: boolean;
  items?: React.ReactNode[];
  children?: React.ReactNode;
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ variant = 'bullet', dense = false, items, children, className, ...props }, ref) => {
    const classes = [
      'uds-list',
      `uds-list--${variant}`,
      dense && 'uds-list--dense',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const content = items != null ? items.map((item, i) => <li key={i} className="uds-list__item">{item}</li>) : children;
    const Tag = variant === 'numbered' ? 'ol' : 'ul';
    return (
      <Tag ref={ref as any} className={classes} {...(props as any)}>
        {content}
      </Tag>
    );
  },
);

List.displayName = 'List';
