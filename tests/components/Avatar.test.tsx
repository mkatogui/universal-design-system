import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Avatar } from '../../packages/react/src/components/Avatar/Avatar';

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    const { container } = render(<Avatar src="/avatar.jpg" alt="Jane Doe" />);
    const wrapper = screen.getByLabelText('Jane Doe');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('uds-avatar');
    const img = container.querySelector('.uds-avatar__image');
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('renders initials when no src is provided', () => {
    render(<Avatar variant="initials" initials="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('falls back to initials when image fails to load', () => {
    const { container } = render(<Avatar src="/bad.jpg" alt="Broken" initials="BD" />);
    const img = container.querySelector('.uds-avatar__image');
    if (img) fireEvent.error(img);
    expect(screen.getByText('BD')).toBeInTheDocument();
  });

  it('renders the fallback element when no src and no initials', () => {
    render(<Avatar fallback={<span>FB</span>} />);
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('applies variant and size modifier classes', () => {
    const { container } = render(<Avatar variant="initials" size="lg" initials="AB" />);
    const root = container.querySelector('.uds-avatar');
    expect(root).toHaveClass('uds-avatar--initials');
    expect(root).toHaveClass('uds-avatar--lg');
  });

  it('uses alt as aria-label on the root div', () => {
    render(<Avatar src="/me.jpg" alt="My Photo" />);
    const root = screen.getByLabelText('My Photo');
    expect(root).toHaveClass('uds-avatar');
  });

  it('uses initials as aria-label when no alt is provided', () => {
    render(<Avatar initials="MK" />);
    expect(screen.getByLabelText('MK')).toBeInTheDocument();
  });

  it('renders a status indicator when status prop is set', () => {
    const { container } = render(<Avatar initials="AB" status="online" />);
    const statusEl = container.querySelector('.uds-avatar__status--online');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute('aria-label', 'online');
  });

  it('renders group variant with children', () => {
    render(
      <Avatar variant="group">
        <span>child1</span>
        <span>child2</span>
      </Avatar>,
    );
    expect(screen.getByText('child1')).toBeInTheDocument();
    expect(screen.getByText('child2')).toBeInTheDocument();
  });

  it('forwards a ref object to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Avatar ref={ref} initials="RF" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-avatar');
  });

  it('forwards a callback ref to the root div', () => {
    const callbackRef = vi.fn();
    render(<Avatar ref={callbackRef} initials="CB" />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a default fallback span when no src, initials, or fallback are provided', () => {
    const { container } = render(<Avatar />);
    const fallback = container.querySelector('.uds-avatar__fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders image with empty alt when src is provided but no alt', () => {
    const { container } = render(<Avatar src="/photo.jpg" />);
    const img = container.querySelector('.uds-avatar__image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
  });
});
