import React, { useState, useCallback } from 'react';

export interface CodeBlockTab {
  label: string;
  language: string;
  code: string;
}

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'syntax-highlighted' | 'terminal' | 'multi-tab';
  size?: 'sm' | 'md' | 'lg';
  language?: string;
  code?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  tabs?: CodeBlockTab[];
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ variant = 'syntax-highlighted', size = 'md', language, code, showLineNumbers, showCopy = true, tabs, className, children, ...props }, ref) => {
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
    ].filter(Boolean).join(' ');

    const activeCode = tabs ? tabs[activeTab]?.code : code;
    const activeLanguage = tabs ? tabs[activeTab]?.language : language;

    const lines = activeCode?.split('\n') || [];

    return (
      <div ref={ref} className={classes} {...props}>
        {tabs && tabs.length > 0 && (
          <div className="uds-code-block__tabs" role="tablist">
            {tabs.map((tab, i) => (
              <button
                key={i}
                className={['uds-code-block__tab', i === activeTab && 'uds-code-block__tab--active'].filter(Boolean).join(' ')}
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
            <button className="uds-code-block__copy" onClick={handleCopy} aria-label="Copy code" type="button">
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <pre className="uds-code-block__pre">
          <code className="uds-code-block__code">
            {showLineNumbers
              ? lines.map((line, i) => (
                  <span key={i} className="uds-code-block__line">
                    <span className="uds-code-block__line-number" aria-hidden="true">{i + 1}</span>
                    {line}
                    {'\n'}
                  </span>
                ))
              : activeCode}
          </code>
        </pre>
        {children}
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';
