import type React from 'react';

export interface TimelineItem {
  title: React.ReactNode;
  content?: React.ReactNode;
  time?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  const classes = ['uds-timeline', className].filter(Boolean).join(' ');
  return (
    <ul className={classes}>
      {items.map((item, i) => (
        <li
          key={typeof item.title === 'string' ? item.title : `timeline-${i}`}
          className="uds-timeline__item"
        >
          <div className="uds-timeline__dot" aria-hidden />
          <div className="uds-timeline__content">
            <div className="uds-timeline__title">{item.title}</div>
            {item.time && <time className="uds-timeline__time">{item.time}</time>}
            {item.content && <div className="uds-timeline__body">{item.content}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
};

Timeline.displayName = 'Timeline';
