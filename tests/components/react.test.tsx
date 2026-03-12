import { act, fireEvent, render, screen, within } from '@testing-library/react';
/**
 * React component tests for the Universal Design System.
 *
 * Tests the 8 core components using React Testing Library patterns:
 * Button, Card, Modal, Tabs, Input, Select, Toast, Alert.
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../../packages/react/src/components/Alert/Alert';
import { Button } from '../../packages/react/src/components/Button/Button';
import { Card } from '../../packages/react/src/components/Card/Card';
import { Input } from '../../packages/react/src/components/Input/Input';
import { Modal } from '../../packages/react/src/components/Modal/Modal';
import { Select } from '../../packages/react/src/components/Select/Select';
import { Tabs } from '../../packages/react/src/components/Tabs/Tabs';
import { Toast } from '../../packages/react/src/components/Toast/Toast';

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the primary variant class by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--primary');
  });

  it('applies the secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--secondary');
  });

  it('applies the ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--ghost');
  });

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--destructive');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--md');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--lg');
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('is disabled and shows a spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveClass('uds-btn--loading');
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button')).toHaveClass('uds-btn--full-width');
  });

  it('applies additional className', () => {
    render(<Button className="custom">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    render(<Card className="my-card">Content</Card>);
    expect(screen.getByText('Content').closest('.uds-card')).toHaveClass('my-card');
  });

  it('renders title as an h3', () => {
    render(<Card title="Card Title" />);
    const heading = screen.getByRole('heading', { level: 3, name: 'Card Title' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('uds-card__title');
  });

  it('renders description as a paragraph', () => {
    render(<Card description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('renders an image when provided', () => {
    render(<Card image="/test.jpg" imageAlt="Test image" />);
    const img = screen.getByRole('img', { name: 'Test image' });
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveClass('uds-card__image');
  });

  it('applies variant and size classes', () => {
    const { container } = render(
      <Card variant="horizontal" size="lg">
        X
      </Card>,
    );
    const card = container.querySelector('.uds-card');
    expect(card).toHaveClass('uds-card--horizontal');
    expect(card).toHaveClass('uds-card--lg');
  });

  it('renders a "Learn more" link when link prop is set', () => {
    render(<Card link="/details">Content</Card>);
    const link = screen.getByRole('link', { name: 'Learn more' });
    expect(link).toHaveAttribute('href', '/details');
  });
});

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
describe('Modal', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        Hidden
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Test Modal');
  });

  it('renders title heading and body content', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Dialog">
        <p>Dialog body</p>
      </Modal>,
    );
    expect(screen.getByRole('heading', { name: 'My Dialog' })).toBeInTheDocument();
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Close Me">
        Body
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Escape Test">
        Body
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders an overlay', () => {
    const { container } = render(
      <Modal open={true} onClose={vi.fn()} title="Overlay">
        Body
      </Modal>,
    );
    // The overlay is portaled to document.body
    const overlay = document.querySelector('.uds-modal-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('calls onClose when the overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Overlay Click">
        Body
      </Modal>,
    );
    const overlay = document.querySelector('.uds-modal-overlay')!;
    // Click on overlay itself (not children)
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders action buttons in the footer', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="With Actions" actions={<button>Confirm</button>}>
        Body
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
describe('Tabs', () => {
  const defaultTabs = [
    { label: 'Tab One', content: <p>Panel one</p> },
    { label: 'Tab Two', content: <p>Panel two</p> },
    { label: 'Tab Three', content: <p>Panel three</p> },
  ];

  it('renders a tablist with all tab triggers', () => {
    render(<Tabs tabs={defaultTabs} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('Tab One');
    expect(tabs[1]).toHaveTextContent('Tab Two');
    expect(tabs[2]).toHaveTextContent('Tab Three');
  });

  it('shows the first panel by default and marks the first tab as selected', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    // First panel visible, others hidden
    expect(panels[0]).not.toHaveAttribute('hidden');
    expect(panels[1]).toHaveAttribute('hidden');
  });

  it('switches panels when a different tab is clicked', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tabs = screen.getAllByRole('tab');

    fireEvent.click(tabs[1]);

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByText('Panel two')).toBeVisible();
  });

  it('calls onChange with the new index when a tab is clicked', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={defaultTabs} onChange={handleChange} />);
    fireEvent.click(screen.getAllByRole('tab')[2]);
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('supports keyboard navigation with ArrowRight', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    // Focus the first tab and press ArrowRight
    tabs[0].focus();
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('supports keyboard navigation with ArrowLeft (wraps around)', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    // First tab selected; press ArrowLeft should wrap to last
    tabs[0].focus();
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });

    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('uses aria-controls and aria-labelledby to link tabs and panels', () => {
    render(<Tabs tabs={defaultTabs} />);
    const tabs = screen.getAllByRole('tab');
    const panels = screen.getAllByRole('tabpanel', { hidden: true });

    // First tab controls first panel
    const controlsId = tabs[0].getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(panels[0]).toHaveAttribute('id', controlsId);
    expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[0].id);
  });
});

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
describe('Input', () => {
  it('renders with a visible label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('fires onChange when the user types', () => {
    const handleChange = vi.fn();
    render(<Input label="Email" onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows error state with error text', () => {
    render(<Input label="Password" errorText="Too short" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('does not show error role when no error', () => {
    render(<Input label="Name" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Input label="Locked" disabled />);
    expect(screen.getByLabelText('Locked')).toBeDisabled();
  });

  it('renders placeholder text', () => {
    render(<Input label="Search" placeholder="Type to search..." />);
    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
  });

  it('renders helper text when no error', () => {
    render(<Input label="Bio" helperText="Tell us about yourself" />);
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });

  it('hides helper text when there is an error', () => {
    render(<Input label="Bio" helperText="Tell us about yourself" errorText="Required" />);
    expect(screen.queryByText('Tell us about yourself')).not.toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows required asterisk in label', () => {
    render(<Input label="Email" required />);
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('applies size classes', () => {
    const { container } = render(<Input label="Sized" size="lg" />);
    expect(container.querySelector('.uds-input')).toHaveClass('uds-input--lg');
  });
});

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
describe('Select', () => {
  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ];

  it('renders all options', () => {
    render(<Select label="Country" options={options} />);
    const select = screen.getByLabelText('Country');
    const renderedOptions = within(select).getAllByRole('option');
    expect(renderedOptions).toHaveLength(3);
    expect(renderedOptions[0]).toHaveTextContent('United States');
    expect(renderedOptions[1]).toHaveTextContent('Canada');
    expect(renderedOptions[2]).toHaveTextContent('Mexico');
  });

  it('fires onChange when an option is selected', () => {
    const handleChange = vi.fn();
    render(<Select label="Country" options={options} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'ca' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies the default value', () => {
    render(<Select label="Country" options={options} defaultValue="mx" />);
    expect(screen.getByLabelText('Country')).toHaveValue('mx');
  });

  it('renders in disabled state', () => {
    render(<Select label="Country" options={options} disabled />);
    expect(screen.getByLabelText('Country')).toBeDisabled();
  });

  it('renders a placeholder option', () => {
    render(<Select label="Country" options={options} placeholder="Choose a country" />);
    const select = screen.getByLabelText('Country');
    const allOptions = within(select).getAllByRole('option');
    expect(allOptions[0]).toHaveTextContent('Choose a country');
    expect(allOptions[0]).toBeDisabled();
  });

  it('shows error text and aria-invalid', () => {
    render(<Select label="Country" options={options} errorText="Required" />);
    expect(screen.getByLabelText('Country')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('shows helper text when no error', () => {
    render(<Select label="Country" options={options} helperText="Where are you based?" />);
    expect(screen.getByText('Where are you based?')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<Select label="Country" options={options} size="lg" />);
    expect(container.querySelector('.uds-select')).toHaveClass('uds-select--lg');
  });
});

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
describe('Toast', () => {
  it('renders the message text', () => {
    render(<Toast message="Saved successfully" />);
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    const { container } = render(<Toast message="Hidden" visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('auto-dismisses after the specified duration', () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    render(<Toast message="Bye" duration={3000} onDismiss={handleDismiss} />);

    expect(handleDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(handleDismiss).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('renders a close button that fires onDismiss', () => {
    const handleDismiss = vi.fn();
    render(<Toast message="Close me" onDismiss={handleDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies variant class for success', () => {
    const { container } = render(<Toast message="Done" variant="success" />);
    expect(container.querySelector('.uds-toast')).toHaveClass('uds-toast--success');
  });

  it('applies variant class for error', () => {
    const { container } = render(<Toast message="Oops" variant="error" />);
    expect(container.querySelector('.uds-toast')).toHaveClass('uds-toast--error');
  });

  it('applies variant class for warning', () => {
    const { container } = render(<Toast message="Careful" variant="warning" />);
    expect(container.querySelector('.uds-toast')).toHaveClass('uds-toast--warning');
  });

  it('uses role="alert" for error and warning variants', () => {
    const { rerender } = render(<Toast message="err" variant="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Toast message="warn" variant="warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for info variant', () => {
    render(<Toast message="info" variant="info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an action element', () => {
    render(<Toast message="Deleted" action={<button>Undo</button>} />);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------
describe('Alert', () => {
  it('renders the message text', () => {
    render(<Alert message="Something happened" />);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(<Alert title="Heads up" message="Info" />);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('applies variant class for info (default)', () => {
    const { container } = render(<Alert message="Info" />);
    expect(container.querySelector('.uds-alert')).toHaveClass('uds-alert--info');
  });

  it('applies variant class for success', () => {
    const { container } = render(<Alert message="Done" variant="success" />);
    expect(container.querySelector('.uds-alert')).toHaveClass('uds-alert--success');
  });

  it('applies variant class for warning', () => {
    const { container } = render(<Alert message="Watch out" variant="warning" />);
    expect(container.querySelector('.uds-alert')).toHaveClass('uds-alert--warning');
  });

  it('applies variant class for error', () => {
    const { container } = render(<Alert message="Bad" variant="error" />);
    expect(container.querySelector('.uds-alert')).toHaveClass('uds-alert--error');
  });

  it('uses role="alert" for error and warning variants', () => {
    const { rerender } = render(<Alert message="err" variant="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert message="warn" variant="warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for info and success variants', () => {
    const { rerender } = render(<Alert message="info" variant="info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Alert message="done" variant="success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not show dismiss button by default', () => {
    render(<Alert message="No dismiss" />);
    expect(screen.queryByRole('button', { name: 'Dismiss alert' })).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    render(<Alert message="Dismiss me" dismissible />);
    expect(screen.getByRole('button', { name: 'Dismiss alert' })).toBeInTheDocument();
  });

  it('removes itself from the DOM when dismissed', () => {
    const handleDismiss = vi.fn();
    render(<Alert message="Bye" dismissible onDismiss={handleDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }));

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Bye')).not.toBeInTheDocument();
  });

  it('renders children alongside message', () => {
    render(
      <Alert message="With children">
        <a href="/details">Learn more</a>
      </Alert>,
    );
    expect(screen.getByRole('link', { name: 'Learn more' })).toBeInTheDocument();
  });
});
