import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '../../packages/react/src/components/Toggle/Toggle';

describe('Toggle', () => {
  it('renders a button with role="switch"', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('sets aria-checked to true when checked is true', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false when checked is false', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the toggled value when clicked', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when currently checked and clicked', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={true} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={false} onChange={handleChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders the button as disabled when disabled prop is true', () => {
    render(<Toggle checked={false} onChange={vi.fn()} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('sets aria-label from the label prop', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Dark mode" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dark mode');
  });

  it('renders the visible label text when variant is with-label', () => {
    render(<Toggle checked={false} onChange={vi.fn()} variant="with-label" label="Notifications" />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('does not render visible label text when variant is standard', () => {
    render(<Toggle checked={false} onChange={vi.fn()} variant="standard" label="Hidden label" />);
    expect(screen.queryByText('Hidden label')).not.toBeInTheDocument();
  });

  it('applies the standard variant class by default', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} />);
    expect(container.querySelector('.uds-toggle')).toHaveClass('uds-toggle--standard');
  });

  it('forwards a ref object to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Toggle ref={ref} checked={false} onChange={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('role', 'switch');
  });

  it('forwards a callback ref to the button element', () => {
    const callbackRef = vi.fn();
    render(<Toggle ref={callbackRef} checked={false} onChange={vi.fn()} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });
});
