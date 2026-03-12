import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { CodeBlock } from '../../packages/react/src/components/CodeBlock/CodeBlock';

describe('CodeBlock', () => {
  it('renders the provided code content', () => {
    render(<CodeBlock code="const x = 1;" language="js" />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('displays the language label in the header', () => {
    render(<CodeBlock code="let y = 2;" language="typescript" />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders a Copy button by default', () => {
    render(<CodeBlock code="hello" />);
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('does not render a Copy button when showCopy is false', () => {
    render(<CodeBlock code="hello" showCopy={false} />);
    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument();
  });

  it('copies code to clipboard and shows "Copied" feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    render(<CodeBlock code="copy me" />);
    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    fireEvent.click(copyButton);
    expect(writeText).toHaveBeenCalledWith('copy me');
  });

  it('renders line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={'line1\nline2'} showLineNumbers />);
    const lineNumbers = document.querySelectorAll('.uds-code-block__line-number');
    expect(lineNumbers).toHaveLength(2);
    expect(lineNumbers[0]).toHaveTextContent('1');
    expect(lineNumbers[1]).toHaveTextContent('2');
  });

  it('renders a tablist with tab buttons in multi-tab mode', () => {
    const tabs = [
      { label: 'React', language: 'tsx', code: 'const A = () => <div />;' },
      { label: 'Vue', language: 'vue', code: '<template><div /></template>' },
    ];
    render(<CodeBlock variant="multi-tab" tabs={tabs} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Vue' })).toBeInTheDocument();
  });

  it('switches active tab and displays the correct code', () => {
    const tabs = [
      { label: 'React', language: 'tsx', code: 'react-code' },
      { label: 'Vue', language: 'vue', code: 'vue-code' },
    ];
    render(<CodeBlock variant="multi-tab" tabs={tabs} />);
    expect(screen.getByText('react-code')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Vue' }));
    expect(screen.getByText('vue-code')).toBeInTheDocument();
  });

  it('marks the first tab as selected by default', () => {
    const tabs = [
      { label: 'Tab A', language: 'js', code: 'a' },
      { label: 'Tab B', language: 'ts', code: 'b' },
    ];
    render(<CodeBlock variant="multi-tab" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'false');
  });

  it('forwards a ref object to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CodeBlock ref={ref} code="ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-code-block');
  });

  it('forwards a callback ref to the root div element', () => {
    const callbackRef = vi.fn();
    render(<CodeBlock ref={callbackRef} code="callback ref" />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
