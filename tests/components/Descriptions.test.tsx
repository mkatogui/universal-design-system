import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Descriptions } from '../../packages/react/src/components/Descriptions/Descriptions';

const sampleItems = [
  { label: 'Name', value: 'John Doe' },
  { label: 'Email', value: 'john@example.com' },
  { label: 'Role', value: 'Admin' },
];

describe('Descriptions', () => {
  it('renders a description list element', () => {
    const { container } = render(<Descriptions items={sampleItems} />);
    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();
  });

  it('renders all item labels and values', () => {
    render(<Descriptions items={sampleItems} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders labels as dt elements with the correct BEM class', () => {
    const { container } = render(<Descriptions items={sampleItems} />);
    const dts = container.querySelectorAll('.uds-descriptions__label');
    expect(dts).toHaveLength(3);
    expect(dts[0].tagName).toBe('DT');
  });

  it('renders values as dd elements with the correct BEM class', () => {
    const { container } = render(<Descriptions items={sampleItems} />);
    const dds = container.querySelectorAll('.uds-descriptions__value');
    expect(dds).toHaveLength(3);
    expect(dds[0].tagName).toBe('DD');
  });

  it('applies the uds-descriptions base class', () => {
    const { container } = render(<Descriptions items={sampleItems} />);
    expect(container.querySelector('.uds-descriptions')).toBeInTheDocument();
  });

  it('applies the horizontal layout modifier by default', () => {
    const { container } = render(<Descriptions items={sampleItems} />);
    expect(container.querySelector('.uds-descriptions--horizontal')).toBeInTheDocument();
  });

  it('applies the vertical layout modifier', () => {
    const { container } = render(<Descriptions items={sampleItems} layout="vertical" />);
    expect(container.querySelector('.uds-descriptions--vertical')).toBeInTheDocument();
  });

  it('applies the bordered layout modifier', () => {
    const { container } = render(<Descriptions items={sampleItems} layout="bordered" />);
    expect(container.querySelector('.uds-descriptions--bordered')).toBeInTheDocument();
  });

  it('passes through a custom className', () => {
    const { container } = render(<Descriptions items={sampleItems} className="my-desc" />);
    const dl = container.querySelector('.uds-descriptions');
    expect(dl).toHaveClass('uds-descriptions');
    expect(dl).toHaveClass('my-desc');
  });

  it('renders an empty list when no items are provided', () => {
    const { container } = render(<Descriptions items={[]} />);
    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();
    expect(container.querySelectorAll('dt')).toHaveLength(0);
    expect(container.querySelectorAll('dd')).toHaveLength(0);
  });

  it('renders ReactNode values (not just strings)', () => {
    const items = [{ label: 'Status', value: <strong>Active</strong> }];
    render(<Descriptions items={items} />);
    expect(screen.getByText('Active').tagName).toBe('STRONG');
  });
});
