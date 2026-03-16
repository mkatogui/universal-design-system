import React from 'react';

export interface DescriptionsItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface DescriptionsProps {
  items: DescriptionsItem[];
  layout?: 'horizontal' | 'vertical' | 'bordered';
  className?: string;
}

export const Descriptions: React.FC<DescriptionsProps> = ({
  items,
  layout = 'horizontal',
  className,
}) => {
  const classes = ['uds-descriptions', `uds-descriptions--${layout}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <dl className={classes}>
      {items.map((item, index) => {
        const key =
          typeof item.label === 'string' || typeof item.label === 'number'
            ? String(item.label)
            : `desc-${index}`;
        return (
          <React.Fragment key={key}>
            <dt className="uds-descriptions__label">{item.label}</dt>
            <dd className="uds-descriptions__value">{item.value}</dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
};

Descriptions.displayName = 'Descriptions';
