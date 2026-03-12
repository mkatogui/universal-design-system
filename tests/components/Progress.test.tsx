import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from '../../packages/react/src/components/Progress/Progress';

describe('Progress', () => {
  it('renders with role="progressbar"', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow, aria-valuemin, and aria-valuemax for bar variant', () => {
    render(<Progress value={40} max={200} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '200');
  });

  it('shows the percentage label when showValue is set', () => {
    render(<Progress value={75} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders a label element for the bar variant', () => {
    render(<Progress value={30} label="Uploading" />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Uploading');
  });

  it('applies variant and size modifier classes', () => {
    render(<Progress variant="bar" size="lg" value={20} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('uds-progress--bar');
    expect(bar).toHaveClass('uds-progress--lg');
  });

  it('omits aria-valuenow in indeterminate mode', () => {
    render(<Progress indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('applies indeterminate modifier class', () => {
    render(<Progress indeterminate />);
    expect(screen.getByRole('progressbar')).toHaveClass('uds-progress--indeterminate');
  });

  it('renders an SVG for the circular variant', () => {
    const { container } = render(<Progress variant="circular" value={60} />);
    expect(container.querySelector('svg.uds-progress__svg')).toBeInTheDocument();
  });

  it('renders two circles (track + fill) in the circular SVG', () => {
    const { container } = render(<Progress variant="circular" value={60} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveClass('uds-progress__track');
    expect(circles[1]).toHaveClass('uds-progress__fill');
  });

  it('shows percentage value for circular variant when showValue is set', () => {
    render(<Progress variant="circular" value={50} showValue />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('does not show percentage when indeterminate and showValue are both set', () => {
    render(<Progress variant="circular" indeterminate showValue />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('clamps value to 100% for percentage display', () => {
    render(<Progress value={150} max={100} showValue />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('forwards a ref object to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={50} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });

  it('forwards a callback ref to the root div', () => {
    const callbackRef = vi.fn();
    render(<Progress ref={callbackRef} value={50} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
