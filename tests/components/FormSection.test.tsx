import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { FormSection } from '../../packages/react/src/components/FormSection/FormSection';

describe('FormSection', () => {
  it('renders title and children', () => {
    render(
      <FormSection title="Contact">
        <input aria-label="Email" />
      </FormSection>,
    );
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<FormSection title="Payment" description="We accept cards and PayPal." />);
    expect(screen.getByRole('heading', { name: 'Payment' })).toBeInTheDocument();
    expect(screen.getByText('We accept cards and PayPal.')).toBeInTheDocument();
  });

  it('uses default heading level 2', () => {
    const { container } = render(<FormSection title="Section" />);
    expect(container.querySelector('.uds-form-section__title')?.tagName).toBe('H2');
  });

  it('uses custom titleLevel', () => {
    const { container } = render(<FormSection title="Section" titleLevel={3} />);
    expect(container.querySelector('.uds-form-section__title')?.tagName).toBe('H3');
  });

  it('applies BEM class and custom className', () => {
    const { container } = render(<FormSection title="X" className="my-section" />);
    const root = container.querySelector('.uds-form-section');
    expect(root).toHaveClass('uds-form-section');
    expect(root).toHaveClass('my-section');
  });
});
