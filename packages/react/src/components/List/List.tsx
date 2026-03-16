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
      items == null
        ? children
        : items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: ReactNode[] items lack stable ids; composite key with content + index is the best option
            <li key={`list-item-${String(item)}-${i}`} className="uds-list__item">
              {item}
            </li>
          ));
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
