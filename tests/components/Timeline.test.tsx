import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../../packages/react/src/components/Timeline/Timeline';

const sampleItems = [
  { title: 'Step 1', content: 'First step description', time: '2024-01-01' },
  { title: 'Step 2', content: 'Second step description', time: '2024-02-01' },
  { title: 'Step 3' },
];

describe('Timeline', () => {
  it('renders a ul element with uds-timeline class', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const ul = container.querySelector('ul.uds-timeline');
    expect(ul).toBeInTheDocument();
  });

  it('renders all timeline items as li elements', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const items = container.querySelectorAll('li.uds-timeline__item');
    expect(items).toHaveLength(3);
  });

  it('renders item titles', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders title in a div with uds-timeline__title class', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const titles = container.querySelectorAll('.uds-timeline__title');
    expect(titles).toHaveLength(3);
    expect(titles[0]).toHaveTextContent('Step 1');
  });

  it('renders item content when provided', () => {
    render(<Timeline items={sampleItems} />);
    expect(screen.getByText('First step description')).toBeInTheDocument();
    expect(screen.getByText('Second step description')).toBeInTheDocument();
  });

  it('renders content in a div with uds-timeline__body class', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const bodies = container.querySelectorAll('.uds-timeline__body');
    expect(bodies).toHaveLength(2); // Only items with content
  });

  it('does not render body when content is not provided', () => {
    const items = [{ title: 'No content' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('.uds-timeline__body')).not.toBeInTheDocument();
  });

  it('renders time when provided', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const timeEls = container.querySelectorAll('time.uds-timeline__time');
    expect(timeEls).toHaveLength(2); // Only items with time
    expect(timeEls[0]).toHaveTextContent('2024-01-01');
    expect(timeEls[1]).toHaveTextContent('2024-02-01');
  });

  it('does not render time element when time is not provided', () => {
    const items = [{ title: 'No time' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelector('time')).not.toBeInTheDocument();
  });

  it('renders a decorative dot for each item', () => {
    const { container } = render(<Timeline items={sampleItems} />);
    const dots = container.querySelectorAll('.uds-timeline__dot');
    expect(dots).toHaveLength(3);
    // Dots are aria-hidden (decorative)
    for (const dot of dots) {
      expect(dot).toHaveAttribute('aria-hidden');
    }
  });

  it('applies a custom className', () => {
    const { container } = render(<Timeline items={sampleItems} className="custom-timeline" />);
    expect(container.querySelector('ul.uds-timeline')).toHaveClass('custom-timeline');
  });

  it('uses title as key when title is a string', () => {
    // This is a structural test — rendering should succeed without key warnings
    const items = [{ title: 'Unique Title' }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelectorAll('li.uds-timeline__item')).toHaveLength(1);
  });

  it('uses index-based key when title is a ReactNode', () => {
    const items = [{ title: <strong>Bold Title</strong> }];
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelectorAll('li.uds-timeline__item')).toHaveLength(1);
    expect(screen.getByText('Bold Title')).toBeInTheDocument();
  });

  it('renders ReactNode as title and content', () => {
    const items = [
      {
        title: <span data-testid="custom-title">Custom</span>,
        content: <div data-testid="custom-content">Rich content</div>,
      },
    ];
    render(<Timeline items={items} />);
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('has displayName', () => {
    expect(Timeline.displayName).toBe('Timeline');
  });
});
