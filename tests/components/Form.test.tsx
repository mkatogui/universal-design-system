import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Form } from '../../packages/react/src/components/Form/Form';

describe('Form', () => {
  it('renders form element with uds-form class', () => {
    const { container } = render(<Form><input type="text" /></Form>);
    const form = container.querySelector('form.uds-form');
    expect(form).toBeInTheDocument();
    expect(form).toContainElement(screen.getByRole('textbox'));
  });
});
