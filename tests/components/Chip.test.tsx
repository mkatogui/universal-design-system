import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from '../../packages/react/src/components/Chip/Chip';

describe('Chip', () => {
  it('renders the label text', () => {
    render(<Chip label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('applies the uds-chip base class', () => {
    const { container } = render(<Chip label="Tag" />);
    expect(container.querySelector('.uds-chip')).toBeInTheDocument();
  });

  it('applies the default variant and size classes', () => {
    const { container } = render(<Chip label="Default" />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip--default');
    expect(chip).toHaveClass('uds-chip--md');
  });

  it('applies the outlined variant class', () => {
    const { container } = render(<Chip label="Outlined" variant="outlined" />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip--outlined');
  });

  it('applies the removable variant class', () => {
    const { container } = render(<Chip label="Removable" variant="removable" />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip--removable');
  });

  it('applies the sm size class', () => {
    const { container } = render(<Chip label="Small" size="sm" />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip--sm');
  });

  it('has role="listitem" on the root span', () => {
    render(<Chip label="Item" />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('does not render a remove button by default', () => {
    render(<Chip label="NoRemove" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a remove button when onRemove is provided', () => {
    render(<Chip label="Closable" onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove Closable' })).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(<Chip label="ClickMe" onRemove={handleRemove} />);
    screen.getByRole('button', { name: 'Remove ClickMe' }).click();
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it('adds the removable modifier class when onRemove is provided', () => {
    const { container } = render(<Chip label="Auto" onRemove={() => {}} />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip--removable');
  });

  it('passes through a custom className', () => {
    const { container } = render(<Chip label="Custom" className="my-chip" />);
    const chip = container.querySelector('.uds-chip');
    expect(chip).toHaveClass('uds-chip');
    expect(chip).toHaveClass('my-chip');
  });

  it('renders the label inside uds-chip__label span', () => {
    const { container } = render(<Chip label="Labeled" />);
    const labelSpan = container.querySelector('.uds-chip__label');
    expect(labelSpan).toBeInTheDocument();
    expect(labelSpan).toHaveTextContent('Labeled');
  });
});
