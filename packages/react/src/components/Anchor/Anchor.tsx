import type React from 'react';

export interface AnchorItem {
  href: string;
  title: string;
}

export interface AnchorProps {
  items: AnchorItem[];
  smoothScroll?: boolean;
  className?: string;
}

export const Anchor: React.FC<AnchorProps> = ({ items, smoothScroll = true, className }) => {
  const classes = ['uds-anchor', className].filter(Boolean).join(' ');
  return (
    <nav className={classes} aria-label="On this page">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              style={smoothScroll ? { scrollBehavior: 'smooth' } : undefined}
              className="uds-anchor__link"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

Anchor.displayName = 'Anchor';
