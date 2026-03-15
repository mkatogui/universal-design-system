import React from 'react';

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
    <div className={classes} role="status" aria-label={title}>
      {illustration && <div className="uds-empty__illustration">{illustration}</div>}
      <h3 className="uds-empty__title">{title}</h3>
      {description && <p className="uds-empty__description">{description}</p>}
      {action && <div className="uds-empty__action">{action}</div>}
    </div>
  );
};

Empty.displayName = 'Empty';
