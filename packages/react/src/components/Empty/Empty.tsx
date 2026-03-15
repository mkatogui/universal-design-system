import type React from 'react';

export interface EmptyProps {
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  title = 'No data',
  description,
  illustration,
  action,
  className,
}) => {
  const classes = ['uds-empty', className].filter(Boolean).join(' ');
  return (
    <output className={classes} aria-label={title} htmlFor="">
      {illustration && <div className="uds-empty__illustration">{illustration}</div>}
      <h3 className="uds-empty__title">{title}</h3>
      {description && <p className="uds-empty__description">{description}</p>}
      {action && <div className="uds-empty__action">{action}</div>}
    </output>
  );
};

Empty.displayName = 'Empty';
