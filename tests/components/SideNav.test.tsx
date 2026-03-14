import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { SideNav } from '../../packages/react/src/components/SideNav/SideNav';

const defaultItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settings', href: '/settings' },
  { label: 'Profile', href: '/profile' },
];

describe('SideNav', () => {
  it('renders a nav element with aria-label="Side navigation"', () => {
    render(<SideNav items={defaultItems} />);
    expect(screen.getByRole('navigation', { name: 'Side navigation' })).toBeInTheDocument();
  });

  it('renders all navigation items as links', () => {
    render(<SideNav items={defaultItems} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent('Dashboard');
    expect(links[1]).toHaveTextContent('Settings');
    expect(links[2]).toHaveTextContent('Profile');
  });

  it('marks the active item using activeItem prop', () => {
    render(<SideNav items={defaultItems} activeItem="/settings" />);
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks item as active using the item.active flag', () => {
    const items = [
      { label: 'Dashboard', href: '/', active: true },
      { label: 'Settings', href: '/settings' },
    ];
    render(<SideNav items={items} />);
    const dashLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashLink).toHaveAttribute('aria-current', 'page');
  });

  it('applies uds-side-nav__item--active class to the active item', () => {
    render(<SideNav items={defaultItems} activeItem="/" />);
    const dashLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashLink.closest('li')).toHaveClass('uds-side-nav__item--active');
  });

  it('inactive items do not have aria-current', () => {
    render(<SideNav items={defaultItems} activeItem="/" />);
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate with the href when a link is clicked', () => {
    const handleNavigate = vi.fn();
    render(<SideNav items={defaultItems} onNavigate={handleNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(handleNavigate).toHaveBeenCalledWith('/settings');
  });

  it('renders nested children recursively', () => {
    const items = [
      {
        label: 'Admin',
        href: '/admin',
        children: [
          { label: 'Users', href: '/admin/users' },
          { label: 'Roles', href: '/admin/roles' },
        ],
      },
    ];
    render(<SideNav items={items} />);
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Roles' })).toBeInTheDocument();
  });

  it('renders sublist when nested children are present', () => {
    const items = [
      {
        label: 'Admin',
        href: '/admin',
        children: [{ label: 'Users', href: '/admin/users' }],
      },
    ];
    const { container } = render(<SideNav items={items} />);
    const sublist = container.querySelector('.uds-side-nav__sublist');
    expect(sublist).toBeInTheDocument();
    expect(sublist?.tagName).toBe('UL');
  });

  it('hides labels when collapsed is true', () => {
    render(<SideNav items={defaultItems} collapsed />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('hides nested children when collapsed is true', () => {
    const items = [
      {
        label: 'Admin',
        href: '/admin',
        children: [{ label: 'Users', href: '/admin/users' }],
      },
    ];
    render(<SideNav items={items} collapsed />);
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('renders sections when sections prop is provided', () => {
    const sections = [
      { title: 'Main', items: [{ label: 'Dashboard', href: '/' }] },
      { title: 'Account', items: [{ label: 'Profile', href: '/profile' }] },
    ];
    render(<SideNav sections={sections} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });

  it('hides section titles when collapsed is true', () => {
    const sections = [{ title: 'Main', items: [{ label: 'Dashboard', href: '/' }] }];
    render(<SideNav sections={sections} collapsed />);
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
  });

  it('applies BEM class modifiers for variant and size', () => {
    render(<SideNav items={defaultItems} variant="with-sections" size="collapsed" />);
    const nav = screen.getByRole('navigation', { name: 'Side navigation' });
    expect(nav).toHaveClass('uds-side-nav--with-sections');
    expect(nav).toHaveClass('uds-side-nav--collapsed');
  });

  it('applies uds-side-nav--collapsed class when collapsed prop is true', () => {
    render(<SideNav items={defaultItems} collapsed />);
    const nav = screen.getByRole('navigation', { name: 'Side navigation' });
    expect(nav).toHaveClass('uds-side-nav--collapsed');
  });

  it('applies additional className to the nav element', () => {
    render(<SideNav items={defaultItems} className="custom-nav" />);
    const nav = screen.getByRole('navigation', { name: 'Side navigation' });
    expect(nav).toHaveClass('custom-nav');
  });

  it('renders item icons when provided', () => {
    const items = [{ label: 'Home', href: '/', icon: <span data-testid="home-icon" /> }];
    render(<SideNav items={items} />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('forwards a ref object to the nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<SideNav items={defaultItems} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('forwards a callback ref to the nav element', () => {
    const callbackRef = vi.fn();
    render(<SideNav items={defaultItems} ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it('renders items without href using # as the fallback href', () => {
    const items = [{ label: 'NoHref' }];
    render(<SideNav items={items} />);
    const link = screen.getByRole('link', { name: 'NoHref' });
    expect(link).toHaveAttribute('href', '#');
  });

  it('does not prevent default when onNavigate is not provided', () => {
    render(<SideNav items={defaultItems} />);
    const link = screen.getByRole('link', { name: 'Settings' });
    // click should not throw; no navigation handler
    fireEvent.click(link);
    expect(link).toBeInTheDocument();
  });

  it('renders sections without a title when title is omitted', () => {
    const sections = [{ items: [{ label: 'Home', href: '/' }] }];
    render(<SideNav sections={sections} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders children directly when neither items nor sections are provided', () => {
    render(
      <SideNav>
        <div data-testid="custom-content">Custom</div>
      </SideNav>,
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });
});
