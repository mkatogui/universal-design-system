import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Accordion } from '../../packages/react/src/components/Accordion/Accordion';

const defaultItems = [
  { title: 'Section One', content: <p>Content one</p> },
  { title: 'Section Two', content: <p>Content two</p> },
  { title: 'Section Three', content: <p>Content three</p> },
];

describe('Accordion', () => {
  it('renders with default BEM classes', () => {
    const { container } = render(<Accordion items={defaultItems} />);
    const root = container.querySelector('.uds-accordion');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('uds-accordion--single');
  });

  it('applies variant modifier classes', () => {
    const { container: c1 } = render(<Accordion items={defaultItems} variant="multi" />);
    expect(c1.querySelector('.uds-accordion')).toHaveClass('uds-accordion--multi');

    const { container: c2 } = render(<Accordion items={defaultItems} variant="flush" />);
    expect(c2.querySelector('.uds-accordion')).toHaveClass('uds-accordion--flush');
  });

  it('renders all item trigger buttons', () => {
    render(<Accordion items={defaultItems} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('Section One');
    expect(buttons[1]).toHaveTextContent('Section Two');
    expect(buttons[2]).toHaveTextContent('Section Three');
  });

  it('panels are hidden by default', () => {
    render(<Accordion items={defaultItems} />);
    const panels = screen.getAllByRole('region', { hidden: true });
    for (const panel of panels) {
      expect(panel).toHaveAttribute('hidden');
    }
  });

  it('expands a panel on click and sets aria-expanded', () => {
    render(<Accordion items={defaultItems} />);
    const buttons = screen.getAllByRole('button');

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content one')).toBeVisible();
  });

  it('collapses an open panel when clicked again', () => {
    render(<Accordion items={defaultItems} defaultExpanded={[0]} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes previously open panel in single mode', () => {
    render(<Accordion items={defaultItems} />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows multiple open panels when allowMultiple is true', () => {
    render(<Accordion items={defaultItems} allowMultiple />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('links trigger buttons to panels via aria-controls and role="region" with aria-labelledby', () => {
    render(<Accordion items={defaultItems} />);
    const buttons = screen.getAllByRole('button');
    const panels = screen.getAllByRole('region', { hidden: true });

    const controlsId = buttons[0].getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(panels[0]).toHaveAttribute('id', controlsId);
    expect(panels[0]).toHaveAttribute('aria-labelledby', buttons[0].id);
  });

  it('disabled items cannot be toggled', () => {
    const items = [
      { title: 'Enabled', content: <p>Enabled</p> },
      { title: 'Disabled', content: <p>Disabled content</p>, disabled: true },
    ];
    render(<Accordion items={items} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();

    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowDown and ArrowUp keys move focus between triggers', () => {
    render(<Accordion items={defaultItems} />);
    const buttons = screen.getAllByRole('button');

    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(buttons[1], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('forwards a ref object to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Accordion ref={ref} items={defaultItems} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-accordion');
  });

  it('forwards a callback ref to the root div', () => {
    const callbackRef = vi.fn();
    render(<Accordion ref={callbackRef} items={defaultItems} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
