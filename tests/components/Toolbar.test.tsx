import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Toolbar } from '../../packages/react/src/components/Toolbar/Toolbar';

describe('Toolbar', () => {
  it('renders with toolbar role and aria-label', () => {
    render(
      <Toolbar aria-label="Formatting">
        <button type="button">B</button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Toolbar aria-label="Actions">
        <button type="button">Save</button>
        <button type="button">Cancel</button>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('applies uds-toolbar class', () => {
    const { container } = render(
      <Toolbar aria-label="Toolbar">
        <span>Content</span>
      </Toolbar>,
    );
    expect(container.querySelector('.uds-toolbar')).toBeInTheDocument();
  });

  it('applies vertical modifier when orientation is vertical', () => {
    const { container } = render(
      <Toolbar aria-label="Vertical" orientation="vertical">
        <span>Item</span>
      </Toolbar>,
    );
    expect(container.querySelector('.uds-toolbar')).toHaveClass('uds-toolbar--vertical');
  });
});
