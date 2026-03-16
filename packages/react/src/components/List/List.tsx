import React from 'react';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: 'bullet' | 'numbered' | 'none';
  dense?: boolean;
  items?: React.ReactNode[];
  children?: React.ReactNode;
}

export const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ variant = 'bullet', dense = false, items, children, className, ...props }, ref) => {
    const classes = ['uds-list', `uds-list--${variant}`, dense && 'uds-list--dense', className]
      .filter(Boolean)
      .join(' ');
    const content =
      items != null
        ? items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: items are ReactNode[] without stable ids
            <li key={i} className="uds-list__item">
              {item}
            </li>
          ))
        : children;
    const listProps = { className: classes, ...props };
    return variant === 'numbered' ? (
      <ol ref={ref as React.Ref<HTMLOListElement>} {...listProps}>
        {content}
      </ol>
    ) : (
      <ul ref={ref as React.Ref<HTMLUListElement>} {...listProps}>
        {content}
      </ul>
    );
  },
);

List.displayName = 'List';
