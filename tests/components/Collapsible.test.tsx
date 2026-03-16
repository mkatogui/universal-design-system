import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible } from '../../packages/react/src/components/Collapsible/Collapsible';

describe('Collapsible', () => {
  it('renders the trigger text', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('hides content by default (uncontrolled)', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Hidden content</p>
      </Collapsible>,
    );
    const content = screen.getByText('Hidden content').closest('section');
    expect(content).toHaveAttribute('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets aria-expanded to false on the trigger by default', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('toggles content visibility on trigger click (uncontrolled)', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Toggled content</p>
      </Collapsible>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle' });
    fireEvent.click(btn);
    const content = screen.getByText('Toggled content').closest('section');
    expect(content).not.toHaveAttribute('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'false');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses content on second click (uncontrolled)', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Toggled content</p>
      </Collapsible>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle' });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const content = screen.getByText('Toggled content').closest('section');
    expect(content).toHaveAttribute('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'true');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects controlled open prop', () => {
    render(
      <Collapsible trigger="Toggle" open={true} onOpenChange={() => {}}>
        <p>Controlled content</p>
      </Collapsible>,
    );
    const content = screen.getByText('Controlled content').closest('section');
    expect(content).not.toHaveAttribute('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'false');
  });

  it('calls onOpenChange when trigger is clicked (controlled)', () => {
    const handleChange = vi.fn();
    render(
      <Collapsible trigger="Toggle" open={false} onOpenChange={handleChange}>
        <p>Content</p>
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onOpenChange with false when closing (controlled)', () => {
    const handleChange = vi.fn();
    render(
      <Collapsible trigger="Toggle" open={true} onOpenChange={handleChange}>
        <p>Content</p>
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('applies the uds-collapsible base class', () => {
    const { container } = render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    expect(container.querySelector('.uds-collapsible')).toBeInTheDocument();
  });

  it('passes through a custom className', () => {
    const { container } = render(
      <Collapsible trigger="Toggle" className="my-collapse">
        <p>Content</p>
      </Collapsible>,
    );
    const root = container.querySelector('.uds-collapsible');
    expect(root).toHaveClass('uds-collapsible');
    expect(root).toHaveClass('my-collapse');
  });

  it('sets aria-controls on trigger linking to the content id', () => {
    render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle' });
    const controlsId = btn.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    const content = document.getElementById(controlsId!);
    expect(content).toBeInTheDocument();
    expect(content?.tagName).toBe('SECTION');
  });

  it('applies uds-collapsible__trigger class to the button', () => {
    const { container } = render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    expect(container.querySelector('.uds-collapsible__trigger')).toBeInTheDocument();
  });

  it('applies uds-collapsible__content class to the content section', () => {
    const { container } = render(
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>,
    );
    expect(container.querySelector('.uds-collapsible__content')).toBeInTheDocument();
  });
});
