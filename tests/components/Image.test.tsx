import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Image } from '../../packages/react/src/components/Image/Image';

describe('Image', () => {
  it('renders an img element with src and alt', () => {
    render(<Image src="/photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('applies uds-image class by default', () => {
    render(<Image src="/photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveClass('uds-image');
  });

  it('applies a custom className', () => {
    render(<Image src="/photo.jpg" alt="A photo" className="custom-img" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveClass('uds-image', 'custom-img');
  });

  it('uses lazy loading by default', () => {
    render(<Image src="/photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('passes additional HTML img attributes', () => {
    render(<Image src="/photo.jpg" alt="A photo" width={200} height={100} />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('width', '200');
    expect(img).toHaveAttribute('height', '100');
  });

  it('renders fallback when image errors and fallback is provided', () => {
    render(<Image src="/broken.jpg" alt="Broken" fallback={<span>Fallback</span>} />);
    const img = screen.getByRole('img', { name: 'Broken' });
    fireEvent.error(img);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies uds-image class to fallback container', () => {
    const { container } = render(
      <Image src="/broken.jpg" alt="Broken" fallback={<span>Fallback</span>} />,
    );
    const img = screen.getByRole('img', { name: 'Broken' });
    fireEvent.error(img);
    expect(container.querySelector('.uds-image')).toBeInTheDocument();
  });

  it('does not render fallback when no error occurs', () => {
    render(<Image src="/photo.jpg" alt="Photo" fallback={<span>Fallback</span>} />);
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo' })).toBeInTheDocument();
  });

  it('keeps showing img when error occurs but no fallback is provided', () => {
    render(<Image src="/broken.jpg" alt="Broken" />);
    const img = screen.getByRole('img', { name: 'Broken' });
    fireEvent.error(img);
    // No fallback, so image stays (even if errored)
    expect(img).toBeInTheDocument();
  });

  it('calls the custom onError handler when image errors', () => {
    const handleError = vi.fn();
    render(<Image src="/broken.jpg" alt="Broken" onError={handleError} />);
    fireEvent.error(screen.getByRole('img', { name: 'Broken' }));
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('applies custom className to fallback container', () => {
    const { container } = render(
      <Image src="/broken.jpg" alt="Broken" className="custom-img" fallback={<span>FB</span>} />,
    );
    fireEvent.error(screen.getByRole('img', { name: 'Broken' }));
    expect(container.querySelector('.custom-img')).toBeInTheDocument();
  });

  it('has displayName', () => {
    expect(Image.displayName).toBe('Image');
  });
});
