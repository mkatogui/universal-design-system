import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { Statistic } from '../../packages/react/src/components/Statistic/Statistic';

describe('Statistic', () => {
  it('renders the value', () => {
    render(<Statistic value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies uds-statistic class and default md size', () => {
    const { container } = render(<Statistic value={100} />);
    const el = container.querySelector('.uds-statistic');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('uds-statistic--md');
  });

  it('renders the label when provided', () => {
    render(<Statistic value={500} label="Total Users" />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toHaveClass('uds-statistic__label');
  });

  it('does not render label element when label is not provided', () => {
    const { container } = render(<Statistic value={500} />);
    expect(container.querySelector('.uds-statistic__label')).not.toBeInTheDocument();
  });

  it('renders a prefix when provided', () => {
    render(<Statistic value={99} prefix="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('$')).toHaveClass('uds-statistic__prefix');
  });

  it('renders a suffix when provided', () => {
    render(<Statistic value={75} suffix="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('%')).toHaveClass('uds-statistic__suffix');
  });

  it('does not render prefix or suffix elements when not provided', () => {
    const { container } = render(<Statistic value={10} />);
    expect(container.querySelector('.uds-statistic__prefix')).not.toBeInTheDocument();
    expect(container.querySelector('.uds-statistic__suffix')).not.toBeInTheDocument();
  });

  it('renders value in the uds-statistic__number span', () => {
    const { container } = render(<Statistic value="1,234" />);
    const numberEl = container.querySelector('.uds-statistic__number');
    expect(numberEl).toBeInTheDocument();
    expect(numberEl).toHaveTextContent('1,234');
  });

  it('applies size variant classes', () => {
    const { container, rerender } = render(<Statistic value={1} size="sm" />);
    expect(container.querySelector('.uds-statistic')).toHaveClass('uds-statistic--sm');

    rerender(<Statistic value={1} size="lg" />);
    expect(container.querySelector('.uds-statistic')).toHaveClass('uds-statistic--lg');
  });

  it('applies a custom className', () => {
    const { container } = render(<Statistic value={1} className="custom-stat" />);
    expect(container.querySelector('.uds-statistic')).toHaveClass('custom-stat');
  });

  it('renders ReactNode as value', () => {
    render(<Statistic value={<strong data-testid="bold-val">99</strong>} />);
    expect(screen.getByTestId('bold-val')).toBeInTheDocument();
  });

  it('renders ReactNode as prefix and suffix', () => {
    render(
      <Statistic
        value={100}
        prefix={<span data-testid="prefix-icon">^</span>}
        suffix={<span data-testid="suffix-icon">pts</span>}
      />,
    );
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('has displayName', () => {
    expect(Statistic.displayName).toBe('Statistic');
  });
});
