import React from 'react';

export interface StatisticProps {
  value: React.ReactNode;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Statistic: React.FC<StatisticProps> = ({
  value,
  label,
  prefix,
  suffix,
  size = 'md',
  className,
}) => {
  const classes = ['uds-statistic', `uds-statistic--${size}`, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {label && <span className="uds-statistic__label">{label}</span>}
      <div className="uds-statistic__value">
        {prefix && <span className="uds-statistic__prefix">{prefix}</span>}
        <span className="uds-statistic__number">{value}</span>
        {suffix && <span className="uds-statistic__suffix">{suffix}</span>}
      </div>
    </div>
  );
};

Statistic.displayName = 'Statistic';
