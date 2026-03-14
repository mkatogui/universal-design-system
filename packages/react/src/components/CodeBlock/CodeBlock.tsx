import React, { useCallback, useState } from 'react';

/**
 * Describes a single tab in a multi-tab {@link CodeBlock}.
 */
export interface CodeBlockTab {
  /** Tab trigger label (e.g. "React"). */
  label: string;
  /** Language identifier shown in the header. */
  language: string;
  /** Source code string. */
  code: string;
}

/**
 * Props for the {@link CodeBlock} component.
 *
 * Extends native `<div>` attributes.
 */
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Display variant. @default 'syntax-highlighted' */
  variant?: 'syntax-highlighted' | 'terminal' | 'multi-tab';
  /** Controls padding and font-size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Language identifier shown in the header (single-tab mode). */
  language?: string;
  /** Source code string (single-tab mode). */
  code?: string;
  /** Show line numbers to the left of each line. */
  showLineNumbers?: boolean;
  /** Show a "Copy" button in the header. @default true */
  showCopy?: boolean;
  /** Tab definitions for multi-tab mode. */
  tabs?: CodeBlockTab[];
}

/**
 * A code display block with optional multi-tab support, line numbers,
 * and a copy-to-clipboard button.
 *
 * Renders a `<pre><code>` structure. In multi-tab mode, a `role="tablist"`
 * row is shown above the code area.
 *
 * Uses BEM class `uds-code-block` with variant and size modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <CodeBlock language="tsx" code={`const x = 1;`} showLineNumbers />
 * ```
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      variant = 'syntax-highlighted',
      size = 'md',
      language,
      code,
      showLineNumbers,
      showCopy = true,
      tabs,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const handleCopy = useCallback(async () => {
      const text = tabs ? tabs[activeTab]?.code : code;
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, [code, tabs, activeTab]);

    const classes = [
      'uds-code-block',
      `uds-code-block--${variant}`,
      `uds-code-block--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const activeCode = tabs ? tabs[activeTab]?.code : code;
    const activeLanguage = tabs ? tabs[activeTab]?.language : language;

    const rawLines = activeCode?.split('\n') || [];
    const numberedLines = rawLines.map((text, lineIndex) => ({ lineNumber: lineIndex + 1, text }));

    return (
      <div ref={ref} className={classes} {...props}>
        {tabs && tabs.length > 0 && (
          <div className="uds-code-block__tabs" role="tablist">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                className={['uds-code-block__tab', i === activeTab && 'uds-code-block__tab--active']
                  .filter(Boolean)
                  .join(' ')}
                role="tab"
                aria-selected={i === activeTab}
                onClick={() => setActiveTab(i)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="uds-code-block__header">
          {activeLanguage && <span className="uds-code-block__language">{activeLanguage}</span>}
          {showCopy && (
            <button
              className="uds-code-block__copy"
              onClick={handleCopy}
              aria-label="Copy code"
              type="button"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <pre className="uds-code-block__pre">
          <code className="uds-code-block__code">
            {showLineNumbers
              ? numberedLines.map(({ lineNumber, text }) => (
                  <span key={lineNumber} className="uds-code-block__line">
                    <span className="uds-code-block__line-number" aria-hidden="true">
                      {lineNumber}
                    </span>
                    {text}
                    {'\n'}
                  </span>
                ))
              : activeCode}
          </code>
        </pre>
        {children}
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
