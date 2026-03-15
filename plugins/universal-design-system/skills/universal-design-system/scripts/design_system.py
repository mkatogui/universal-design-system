#!/usr/bin/env python3
"""
Universal Design System — Design System Generator

Generates a complete design system specification from a query,
including palette, tokens, components, patterns, and guidelines.

Usage:
    python src/scripts/design_system.py "fintech dashboard"
    python src/scripts/design_system.py "kids education app" --format markdown
    python src/scripts/design_system.py "saas landing page" --format json
    python src/scripts/design_system.py "saas landing page" --format tailwind
    python src/scripts/design_system.py "saas landing page" --format css-in-js
    python src/scripts/design_system.py "fintech dashboard" --framework react
    python src/scripts/design_system.py "fintech dashboard" --framework vue
    python src/scripts/design_system.py "fintech dashboard" --framework svelte
    python src/scripts/design_system.py "fintech dashboard" --framework web-components
    python src/scripts/design_system.py "test app" --unstyled
    python src/scripts/design_system.py "fintech dashboard" --unstyled --format json
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Optional

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine, load_csv
try:
    from registry import get_all_palettes, get_custom_palette_names
except ImportError:
    get_all_palettes = None
    get_custom_palette_names = None

TOKENS_PATH = Path(__file__).parent.parent.parent / "tokens" / "design-tokens.json"

FRAMEWORK_TEMPLATES = {
    "react": {
        "button": '''import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'uds-btn inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'uds-btn--primary bg-[var(--color-brand-primary)] text-[var(--color-text-on-brand)] hover:opacity-90',
        secondary: 'uds-btn--secondary bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]',
        ghost: 'uds-btn--ghost hover:bg-[var(--color-bg-secondary)]',
        destructive: 'uds-btn--destructive bg-[var(--color-error)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
  )
);
Button.displayName = 'Button';''',
        "card": '''import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`uds-card rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-6 shadow-[var(--shadow-md)] ${className}`} {...props}>
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`uds-card__header mb-4 ${className}`} {...props}>{children}</div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }>(
  ({ children, className = '', ...props }, ref) => (
    <h3 ref={ref} className={`uds-card__title text-xl font-semibold text-[var(--color-text-primary)] ${className}`} {...props}>{children}</h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`uds-card__content text-[var(--color-text-secondary)] ${className}`} {...props}>{children}</div>
  )
);
CardContent.displayName = 'CardContent';''',
        "input": '''import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\\s+/g, '-');
    return (
      <div className="uds-input space-y-1.5">
        {label && <label htmlFor={inputId} className="uds-input__label text-sm font-medium text-[var(--color-text-primary)]">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`uds-input__field w-full rounded-[var(--radius-md)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-50 ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
          {...props}
        />
        {error && <p className="uds-input__error text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';''',
        "modal": '''import React, { forwardRef, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const modalVariants = cva(
  'uds-modal fixed inset-0 z-[var(--z-index-modal,50)] flex items-center justify-center',
  {
    variants: {
      size: {
        sm: '[&_.uds-modal__panel]:max-w-[400px]',
        md: '[&_.uds-modal__panel]:max-w-[560px]',
        lg: '[&_.uds-modal__panel]:max-w-[720px]',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, children, actions, size }, ref) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleKey);
      panelRef.current?.focus();
      return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div ref={ref} className={modalVariants({ size })}>
        <div className="uds-modal__backdrop fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="uds-modal__panel relative w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-6 shadow-[var(--shadow-xl)]"
        >
          <h2 className="uds-modal__title text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <div className="uds-modal__body mt-4 text-[var(--color-text-secondary)]">{children}</div>
          {actions && <div className="uds-modal__actions mt-6 flex justify-end gap-3">{actions}</div>}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';''',
        "alert": '''import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'uds-alert flex gap-3 rounded-[var(--radius-md)] border p-4',
  {
    variants: {
      variant: {
        info: 'uds-alert--info border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)]',
        success: 'uds-alert--success border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]',
        warning: 'uds-alert--warning border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
        error: 'uds-alert--error border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, title, children, dismissible, onDismiss, className, ...props }, ref) => (
    <div
      ref={ref}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      className={alertVariants({ variant, className })}
      {...props}
    >
      <div className="uds-alert__content flex-1">
        {title && <p className="uds-alert__title font-semibold">{title}</p>}
        <div className="uds-alert__message text-sm">{children}</div>
      </div>
      {dismissible && (
        <button onClick={onDismiss} className="uds-alert__dismiss self-start text-current opacity-70 hover:opacity-100" aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  )
);
Alert.displayName = 'Alert';''',
        "badge": '''import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'uds-badge inline-flex items-center rounded-[var(--radius-full)] font-medium',
  {
    variants: {
      variant: {
        status: 'uds-badge--status',
        count: 'uds-badge--count',
        tag: 'uds-badge--tag',
      },
      color: {
        default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
        brand: 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]',
        success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
        error: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs h-5',
        md: 'px-2.5 py-0.5 text-sm h-6',
      },
    },
    defaultVariants: { variant: 'status', color: 'default', size: 'md' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, color, size, removable, onRemove, children, className, ...props }, ref) => (
    <span ref={ref} className={badgeVariants({ variant, color, size, className })} {...props}>
      {children}
      {removable && (
        <button onClick={onRemove} className="uds-badge__remove ml-1 opacity-70 hover:opacity-100" aria-label="Remove">
          &times;
        </button>
      )}
    </span>
  )
);
Badge.displayName = 'Badge';''',
        "tabs": '''import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const tabListVariants = cva(
  'uds-tabs flex',
  {
    variants: {
      variant: {
        line: 'uds-tabs--line border-b border-[var(--color-border-default)] gap-0',
        pill: 'uds-tabs--pill gap-1 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-1',
        segmented: 'uds-tabs--segmented gap-0 rounded-[var(--radius-md)] border border-[var(--color-border-default)]',
      },
    },
    defaultVariants: { variant: 'line' },
  }
);

interface Tab { id: string; label: string; content: React.ReactNode; disabled?: boolean; }

interface TabsProps extends VariantProps<typeof tabListVariants> {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, defaultTab, onChange, variant, className }, ref) => {
    const [active, setActive] = useState(defaultTab || tabs[0]?.id);

    const handleSelect = (id: string) => {
      setActive(id);
      onChange?.(id);
    };

    return (
      <div ref={ref} className={className}>
        <div role="tablist" className={tabListVariants({ variant })} aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleSelect(tab.id)}
              className={`uds-tabs__tab px-4 py-2 text-sm font-medium transition-colors ${
                active === tab.id
                  ? 'text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={active !== tab.id}
            className="uds-tabs__panel mt-4"
          >
            {tab.content}
          </div>
        ))}
      </div>
    );
  }
);
Tabs.displayName = 'Tabs';''',
        "data-table": '''import React, { forwardRef } from 'react';

interface Column<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  density?: 'compact' | 'default' | 'comfortable';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

function DataTableInner<T extends Record<string, unknown>>(
  { columns, data, density = 'default', onSort, className = '' }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  const densityClass = {
    compact: 'uds-data-table--compact [&_td]:py-1 [&_th]:py-1',
    default: 'uds-data-table--default [&_td]:py-3 [&_th]:py-3',
    comfortable: 'uds-data-table--comfortable [&_td]:py-4 [&_th]:py-4',
  }[density];

  return (
    <div className={`uds-data-table overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] ${className}`}>
      <table ref={ref} role="table" className={`w-full text-sm ${densityClass}`}>
        <thead className="bg-[var(--color-bg-secondary)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="uds-data-table__th px-4 text-left font-medium text-[var(--color-text-secondary)] cursor-default"
                onClick={col.sortable && onSort ? () => onSort(col.key, 'asc') : undefined}
                aria-sort={col.sortable ? 'none' : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-default)]">
          {data.map((row, i) => (
            <tr key={i} className="uds-data-table__row bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)]">
              {columns.map((col) => (
                <td key={col.key} className="uds-data-table__td px-4 text-[var(--color-text-primary)]">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <T extends Record<string, unknown>>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLTableElement> }
) => React.ReactElement;''',
        "select": '''import React, { forwardRef } from 'react';

interface SelectOption { value: string; label: string; disabled?: boolean; }

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, size = 'md', className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\\s+/g, '-');
    const sizeClass = { sm: 'h-9 text-sm', md: 'h-11', lg: 'h-[52px] text-lg' }[size];

    return (
      <div className="uds-select space-y-1.5">
        {label && <label htmlFor={selectId} className="uds-select__label text-sm font-medium text-[var(--color-text-primary)]">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={`uds-select__field w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 text-[var(--color-text-primary)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-50 ${sizeClass} ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="uds-select__error text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';''',
        "accordion": '''import React, { forwardRef, useState } from 'react';

interface AccordionItem { id: string; title: string; content: React.ReactNode; }

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  variant?: 'single' | 'multi' | 'flush';
  className?: string;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, allowMultiple = false, defaultExpanded = [], variant = 'single', className = '' }, ref) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

    const toggle = (id: string) => {
      setExpanded((prev) => {
        const next = new Set(allowMultiple ? prev : []);
        if (prev.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const flushClass = variant === 'flush' ? '' : 'rounded-[var(--radius-md)] border border-[var(--color-border-default)]';

    return (
      <div ref={ref} className={`uds-accordion uds-accordion--${variant} ${flushClass} divide-y divide-[var(--color-border-default)] ${className}`}>
        {items.map((item) => {
          const isOpen = expanded.has(item.id);
          return (
            <div key={item.id} className="uds-accordion__item">
              <button
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                className="uds-accordion__trigger flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              >
                {item.title}
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">&#9662;</span>
              </button>
              <div
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-trigger-${item.id}`}
                hidden={!isOpen}
                className="uds-accordion__panel px-4 pb-4 text-sm text-[var(--color-text-secondary)]"
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);
Accordion.displayName = 'Accordion';''',
        "stack": '''import React, { forwardRef } from 'react';

type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: GapSize;
  children: React.ReactNode;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ gap = 'md', children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`uds-stack ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: `var(--layout-stack-gap-${gap})`, ...style }}
      {...props}
    >
      {children}
    </div>
  )
);
Stack.displayName = 'Stack';''',
        "grid": '''import React, { forwardRef } from 'react';

type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GapSize;
  children: React.ReactNode;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 3, gap = 'md', children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`uds-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `var(--layout-stack-gap-${gap})`,
        containerType: 'inline-size',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
Grid.displayName = 'Grid';''',
    },
    "vue": {
        "button": '''<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <button
    :class="[
      'uds-btn',
      `uds-btn--${variant || 'primary'}`,
      `uds-btn--${size || 'md'}`,
    ]"
  >
    <slot />
  </button>
</template>

<style scoped>
.uds-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-out);
}
.uds-btn--primary { background: var(--color-brand-primary); color: var(--color-text-on-brand); }
.uds-btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.uds-btn--ghost { background: transparent; color: var(--color-text-primary); }
.uds-btn--destructive { background: var(--color-error); color: white; }
.uds-btn--sm { height: 36px; padding: 0 12px; font-size: 0.875rem; }
.uds-btn--md { height: 44px; padding: 0 16px; }
.uds-btn--lg { height: 48px; padding: 0 24px; font-size: 1.125rem; }
</style>''',
        "card": '''<script setup lang="ts">
defineProps<{
  padding?: string;
}>();
</script>

<template>
  <div class="uds-card">
    <div v-if="$slots.header" class="uds-card__header">
      <slot name="header" />
    </div>
    <div class="uds-card__content">
      <slot />
    </div>
    <div v-if="$slots.footer" class="uds-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.uds-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.uds-card__header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-default);
}
.uds-card__content { padding: var(--space-6); }
.uds-card__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-default);
}
</style>''',
        "input": '''<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputId = computed(() =>
  props.label?.toLowerCase().replace(/\\s+/g, '-') || undefined
);
</script>

<template>
  <div class="uds-input">
    <label v-if="label" :for="inputId" class="uds-input__label">{{ label }}</label>
    <input
      :id="inputId"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="['uds-input__field', { 'uds-input__field--error': error }]"
      :aria-invalid="error ? 'true' : undefined"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="uds-input__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.uds-input { display: flex; flex-direction: column; gap: 6px; }
.uds-input__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
.uds-input__field {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-input);
  background: var(--color-bg-primary);
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  transition: border-color var(--duration-fast) var(--ease-out);
}
.uds-input__field::placeholder { color: var(--color-text-tertiary); }
.uds-input__field:focus { border-color: var(--color-brand-primary); outline: none; box-shadow: 0 0 0 2px rgba(var(--color-brand-primary), 0.2); }
.uds-input__field:disabled { opacity: 0.5; cursor: not-allowed; }
.uds-input__field--error { border-color: var(--color-error); }
.uds-input__error { font-size: 0.875rem; color: var(--color-error); }
</style>''',
        "modal": '''<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps<{
  open: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const emit = defineEmits<{
  close: [];
}>();

const panelRef = ref<HTMLElement | null>(null);

const sizeClass: Record<string, string> = {
  sm: 'uds-modal__panel--sm',
  md: 'uds-modal__panel--md',
  lg: 'uds-modal__panel--lg',
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

watch(() => props.open, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown);
    panelRef.value?.focus();
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="uds-modal">
      <div class="uds-modal__backdrop" @click="emit('close')" aria-hidden="true" />
      <div
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        :class="['uds-modal__panel', sizeClass[size || 'md']]"
      >
        <h2 class="uds-modal__title">{{ title }}</h2>
        <div class="uds-modal__body"><slot /></div>
        <div v-if="$slots.actions" class="uds-modal__actions"><slot name="actions" /></div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.uds-modal { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; }
.uds-modal__backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); }
.uds-modal__panel {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  padding: var(--space-6);
  box-shadow: var(--shadow-xl);
}
.uds-modal__panel--sm { max-width: 400px; }
.uds-modal__panel--md { max-width: 560px; }
.uds-modal__panel--lg { max-width: 720px; }
.uds-modal__title { font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary); }
.uds-modal__body { margin-top: var(--space-4); color: var(--color-text-secondary); }
.uds-modal__actions { margin-top: var(--space-6); display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>''',
        "alert": '''<script setup lang="ts">
defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <div
    :class="['uds-alert', `uds-alert--${variant || 'info'}`]"
    :role="variant === 'error' || variant === 'warning' ? 'alert' : 'status'"
  >
    <div class="uds-alert__content">
      <p v-if="title" class="uds-alert__title">{{ title }}</p>
      <div class="uds-alert__message"><slot /></div>
    </div>
    <button v-if="dismissible" class="uds-alert__dismiss" @click="emit('dismiss')" aria-label="Dismiss">&times;</button>
  </div>
</template>

<style scoped>
.uds-alert { display: flex; gap: 12px; border-radius: var(--radius-md); border: 1px solid; padding: var(--space-4); }
.uds-alert--info { border-color: var(--color-info); background: color-mix(in srgb, var(--color-info) 10%, transparent); color: var(--color-info); }
.uds-alert--success { border-color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); }
.uds-alert--warning { border-color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning); }
.uds-alert--error { border-color: var(--color-error); background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
.uds-alert__content { flex: 1; }
.uds-alert__title { font-weight: 600; }
.uds-alert__message { font-size: 0.875rem; }
.uds-alert__dismiss { align-self: flex-start; opacity: 0.7; background: none; border: none; color: currentColor; cursor: pointer; font-size: 1.25rem; }
.uds-alert__dismiss:hover { opacity: 1; }
</style>''',
        "badge": '''<script setup lang="ts">
defineProps<{
  variant?: 'status' | 'count' | 'tag';
  color?: 'default' | 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <span :class="[
    'uds-badge',
    `uds-badge--${variant || 'status'}`,
    `uds-badge--${color || 'default'}`,
    `uds-badge--${size || 'md'}`,
  ]">
    <slot />
    <button v-if="removable" class="uds-badge__remove" @click="emit('remove')" aria-label="Remove">&times;</button>
  </span>
</template>

<style scoped>
.uds-badge { display: inline-flex; align-items: center; border-radius: 9999px; font-weight: 500; }
.uds-badge--sm { padding: 2px 8px; font-size: 0.75rem; height: 20px; }
.uds-badge--md { padding: 2px 10px; font-size: 0.875rem; height: 24px; }
.uds-badge--default { background: var(--color-bg-tertiary); color: var(--color-text-primary); }
.uds-badge--brand { background: color-mix(in srgb, var(--color-brand-primary) 10%, transparent); color: var(--color-brand-primary); }
.uds-badge--success { background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); }
.uds-badge--warning { background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning); }
.uds-badge--error { background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
.uds-badge__remove { margin-left: 4px; opacity: 0.7; background: none; border: none; color: currentColor; cursor: pointer; }
.uds-badge__remove:hover { opacity: 1; }
</style>''',
        "tabs": '''<script setup lang="ts">
import { ref } from 'vue';

interface Tab { id: string; label: string; disabled?: boolean; }

const props = defineProps<{
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'line' | 'pill' | 'segmented';
}>();

const emit = defineEmits<{
  change: [tabId: string];
}>();

const active = ref(props.defaultTab || props.tabs[0]?.id);

const select = (id: string) => {
  active.value = id;
  emit('change', id);
};
</script>

<template>
  <div class="uds-tabs">
    <div role="tablist" :class="['uds-tabs__list', `uds-tabs__list--${variant || 'line'}`]" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :id="`tab-${tab.id}`"
        :aria-selected="active === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :disabled="tab.disabled"
        :class="['uds-tabs__tab', { 'uds-tabs__tab--active': active === tab.id }]"
        @click="select(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in tabs"
      :key="tab.id"
      role="tabpanel"
      :id="`panel-${tab.id}`"
      :aria-labelledby="`tab-${tab.id}`"
      :hidden="active !== tab.id"
      class="uds-tabs__panel"
    >
      <slot :name="tab.id" />
    </div>
  </div>
</template>

<style scoped>
.uds-tabs__list--line { display: flex; border-bottom: 1px solid var(--color-border-default); }
.uds-tabs__list--pill { display: flex; gap: 4px; border-radius: var(--radius-lg); background: var(--color-bg-secondary); padding: 4px; }
.uds-tabs__list--segmented { display: flex; border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
.uds-tabs__tab {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}
.uds-tabs__tab:hover { color: var(--color-text-primary); }
.uds-tabs__tab--active { color: var(--color-brand-primary); border-bottom: 2px solid var(--color-brand-primary); }
.uds-tabs__tab:disabled { opacity: 0.5; pointer-events: none; }
.uds-tabs__panel { margin-top: var(--space-4); }
</style>''',
        "data-table": '''<script setup lang="ts">
interface Column { key: string; header: string; sortable?: boolean; }

defineProps<{
  columns: Column[];
  data: Record<string, unknown>[];
  density?: 'compact' | 'default' | 'comfortable';
}>();

const emit = defineEmits<{
  sort: [key: string, direction: 'asc' | 'desc'];
}>();
</script>

<template>
  <div class="uds-data-table" :class="`uds-data-table--${density || 'default'}`">
    <table role="table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="uds-data-table__th"
            :aria-sort="col.sortable ? 'none' : undefined"
            @click="col.sortable ? emit('sort', col.key, 'asc') : undefined"
          >
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data" :key="i" class="uds-data-table__row">
          <td v-for="col in columns" :key="col.key" class="uds-data-table__td">
            {{ row[col.key] ?? '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.uds-data-table { overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
.uds-data-table table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.uds-data-table thead { background: var(--color-bg-secondary); }
.uds-data-table__th { padding: 12px 16px; text-align: left; font-weight: 500; color: var(--color-text-secondary); }
.uds-data-table__td { padding: 12px 16px; color: var(--color-text-primary); }
.uds-data-table__row { background: var(--color-bg-primary); border-top: 1px solid var(--color-border-default); }
.uds-data-table__row:hover { background: var(--color-bg-secondary); }
.uds-data-table--compact .uds-data-table__th,
.uds-data-table--compact .uds-data-table__td { padding: 4px 16px; }
.uds-data-table--comfortable .uds-data-table__th,
.uds-data-table--comfortable .uds-data-table__td { padding: 16px; }
</style>''',
        "select": '''<script setup lang="ts">
import { computed } from 'vue';

interface Option { value: string; label: string; disabled?: boolean; }

const props = defineProps<{
  modelValue?: string;
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const selectId = computed(() =>
  props.label?.toLowerCase().replace(/\\s+/g, '-') || undefined
);

const sizeClass: Record<string, string> = {
  sm: 'uds-select__field--sm',
  md: 'uds-select__field--md',
  lg: 'uds-select__field--lg',
};
</script>

<template>
  <div class="uds-select">
    <label v-if="label" :for="selectId" class="uds-select__label">{{ label }}</label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="['uds-select__field', sizeClass[size || 'md'], { 'uds-select__field--error': error }]"
      :aria-invalid="error ? 'true' : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="uds-select__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.uds-select { display: flex; flex-direction: column; gap: 6px; }
.uds-select__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
.uds-select__field {
  width: 100%;
  appearance: none;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-input);
  background: var(--color-bg-primary);
  padding: 0 12px;
  color: var(--color-text-primary);
  transition: border-color var(--duration-fast) var(--ease-out);
}
.uds-select__field:focus { border-color: var(--color-brand-primary); outline: none; box-shadow: 0 0 0 2px rgba(var(--color-brand-primary), 0.2); }
.uds-select__field:disabled { opacity: 0.5; cursor: not-allowed; }
.uds-select__field--sm { height: 36px; font-size: 0.875rem; }
.uds-select__field--md { height: 44px; }
.uds-select__field--lg { height: 52px; font-size: 1.125rem; }
.uds-select__field--error { border-color: var(--color-error); }
.uds-select__error { font-size: 0.875rem; color: var(--color-error); }
</style>''',
        "accordion": '''<script setup lang="ts">
import { ref } from 'vue';

interface AccordionItem { id: string; title: string; }

const props = defineProps<{
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  variant?: 'single' | 'multi' | 'flush';
}>();

const expanded = ref<Set<string>>(new Set(props.defaultExpanded || []));

const toggle = (id: string) => {
  if (expanded.value.has(id)) {
    expanded.value.delete(id);
  } else {
    if (!props.allowMultiple) expanded.value.clear();
    expanded.value.add(id);
  }
  expanded.value = new Set(expanded.value);
};
</script>

<template>
  <div :class="['uds-accordion', `uds-accordion--${variant || 'single'}`]">
    <div v-for="item in items" :key="item.id" class="uds-accordion__item">
      <button
        :aria-expanded="expanded.has(item.id)"
        :aria-controls="`accordion-panel-${item.id}`"
        class="uds-accordion__trigger"
        @click="toggle(item.id)"
      >
        {{ item.title }}
        <span :class="['uds-accordion__icon', { 'uds-accordion__icon--open': expanded.has(item.id) }]" aria-hidden="true">&#9662;</span>
      </button>
      <div
        v-show="expanded.has(item.id)"
        :id="`accordion-panel-${item.id}`"
        role="region"
        class="uds-accordion__panel"
      >
        <slot :name="item.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.uds-accordion { border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
.uds-accordion--flush { border: none; border-radius: 0; }
.uds-accordion__item { border-top: 1px solid var(--color-border-default); }
.uds-accordion__item:first-child { border-top: none; }
.uds-accordion__trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
}
.uds-accordion__trigger:hover { background: var(--color-bg-secondary); }
.uds-accordion__icon { transition: transform var(--duration-fast) var(--ease-out); }
.uds-accordion__icon--open { transform: rotate(180deg); }
.uds-accordion__panel { padding: 0 16px 16px; font-size: 0.875rem; color: var(--color-text-secondary); }
</style>''',
        "stack": '''<script setup lang="ts">
defineProps<{
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>();
</script>

<template>
  <div class="uds-stack" :style="{ gap: `var(--layout-stack-gap-${gap || 'md'})` }">
    <slot />
  </div>
</template>

<style scoped>
.uds-stack { display: flex; flex-direction: column; }
</style>''',
        "grid": '''<script setup lang="ts">
defineProps<{
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>();
</script>

<template>
  <div
    class="uds-grid"
    :style="{
      gridTemplateColumns: `repeat(${columns || 3}, 1fr)`,
      gap: `var(--layout-stack-gap-${gap || 'md'})`,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.uds-grid { display: grid; container-type: inline-size; }
</style>''',
    },
    "svelte": {
        "button": '''<script lang="ts">
  let { variant = 'primary', size = 'md', onclick, children, ...restProps }: {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    onclick?: (e: MouseEvent) => void;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button class="uds-btn uds-btn--{variant} uds-btn--{size}" {onclick} {...restProps}>
  {@render children?.()}
</button>

<style>
  .uds-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all var(--duration-fast) var(--ease-out);
    cursor: pointer;
    border: none;
  }
  .uds-btn--primary { background: var(--color-brand-primary); color: var(--color-text-on-brand); }
  .uds-btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
  .uds-btn--ghost { background: transparent; color: var(--color-text-primary); }
  .uds-btn--destructive { background: var(--color-error); color: white; }
  .uds-btn--sm { height: 36px; padding: 0 12px; font-size: 0.875rem; }
  .uds-btn--md { height: 44px; padding: 0 16px; }
  .uds-btn--lg { height: 48px; padding: 0 24px; font-size: 1.125rem; }
</style>''',
        "card": '''<script lang="ts">
  let { children, ...restProps }: {
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="uds-card" {...restProps}>
  {@render children?.()}
</div>

<style>
  .uds-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
    background: var(--color-bg-primary);
    padding: var(--space-6);
    box-shadow: var(--shadow-md);
  }
</style>''',
        "input": '''<script lang="ts">
  let {
    value = $bindable(''),
    label = '',
    error = '',
    placeholder = '',
    type = 'text',
    disabled = false,
    ...restProps
  }: {
    value?: string;
    label?: string;
    error?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    [key: string]: unknown;
  } = $props();

  const inputId = label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined;
</script>

<div class="uds-input">
  {#if label}
    <label for={inputId} class="uds-input__label">{label}</label>
  {/if}
  <input
    id={inputId}
    {type}
    bind:value
    {placeholder}
    {disabled}
    class="uds-input__field"
    class:uds-input__field--error={!!error}
    aria-invalid={error ? 'true' : undefined}
    {...restProps}
  />
  {#if error}
    <p class="uds-input__error">{error}</p>
  {/if}
</div>

<style>
  .uds-input { display: flex; flex-direction: column; gap: 6px; }
  .uds-input__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
  .uds-input__field {
    width: 100%;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-input);
    background: var(--color-bg-primary);
    padding: 8px 12px;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    transition: border-color var(--duration-fast) var(--ease-out);
  }
  .uds-input__field::placeholder { color: var(--color-text-tertiary); }
  .uds-input__field:focus { border-color: var(--color-brand-primary); outline: none; box-shadow: 0 0 0 2px rgba(var(--color-brand-primary), 0.2); }
  .uds-input__field:disabled { opacity: 0.5; cursor: not-allowed; }
  .uds-input__field--error { border-color: var(--color-error); }
  .uds-input__error { font-size: 0.875rem; color: var(--color-error); }
</style>''',
        "modal": '''<script lang="ts">
  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    onclose,
    children,
    actions,
  }: {
    open?: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    onclose?: () => void;
    children?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
  } = $props();

  let panelEl: HTMLElement | undefined = $state();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { open = false; onclose?.(); }
  }

  function handleBackdropClick() { open = false; onclose?.(); }

  $effect(() => {
    if (open) panelEl?.focus();
  });
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div class="uds-modal">
    <div class="uds-modal__backdrop" onclick={handleBackdropClick} aria-hidden="true"></div>
    <div
      bind:this={panelEl}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      class="uds-modal__panel uds-modal__panel--{size}"
    >
      <h2 class="uds-modal__title">{title}</h2>
      <div class="uds-modal__body">{@render children?.()}</div>
      {#if actions}
        <div class="uds-modal__actions">{@render actions?.()}</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .uds-modal { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; }
  .uds-modal__backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); }
  .uds-modal__panel {
    position: relative; width: 100%;
    border-radius: var(--radius-lg); border: 1px solid var(--color-border-default);
    background: var(--color-bg-primary); padding: var(--space-6); box-shadow: var(--shadow-xl);
  }
  .uds-modal__panel--sm { max-width: 400px; }
  .uds-modal__panel--md { max-width: 560px; }
  .uds-modal__panel--lg { max-width: 720px; }
  .uds-modal__title { font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary); }
  .uds-modal__body { margin-top: var(--space-4); color: var(--color-text-secondary); }
  .uds-modal__actions { margin-top: var(--space-6); display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>''',
        "alert": '''<script lang="ts">
  let {
    variant = 'info',
    title = '',
    dismissible = false,
    ondismiss,
    children,
  }: {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    ondismiss?: () => void;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<div
  class="uds-alert uds-alert--{variant}"
  role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
>
  <div class="uds-alert__content">
    {#if title}
      <p class="uds-alert__title">{title}</p>
    {/if}
    <div class="uds-alert__message">{@render children?.()}</div>
  </div>
  {#if dismissible}
    <button class="uds-alert__dismiss" onclick={ondismiss} aria-label="Dismiss">&times;</button>
  {/if}
</div>

<style>
  .uds-alert { display: flex; gap: 12px; border-radius: var(--radius-md); border: 1px solid; padding: var(--space-4); }
  .uds-alert--info { border-color: var(--color-info); background: color-mix(in srgb, var(--color-info) 10%, transparent); color: var(--color-info); }
  .uds-alert--success { border-color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); }
  .uds-alert--warning { border-color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning); }
  .uds-alert--error { border-color: var(--color-error); background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
  .uds-alert__content { flex: 1; }
  .uds-alert__title { font-weight: 600; }
  .uds-alert__message { font-size: 0.875rem; }
  .uds-alert__dismiss { align-self: flex-start; opacity: 0.7; background: none; border: none; color: currentColor; cursor: pointer; font-size: 1.25rem; }
  .uds-alert__dismiss:hover { opacity: 1; }
</style>''',
        "badge": '''<script lang="ts">
  let {
    variant = 'status',
    color = 'default',
    size = 'md',
    removable = false,
    onremove,
    children,
  }: {
    variant?: 'status' | 'count' | 'tag';
    color?: 'default' | 'brand' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
    removable?: boolean;
    onremove?: () => void;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<span class="uds-badge uds-badge--{variant} uds-badge--{color} uds-badge--{size}">
  {@render children?.()}
  {#if removable}
    <button class="uds-badge__remove" onclick={onremove} aria-label="Remove">&times;</button>
  {/if}
</span>

<style>
  .uds-badge { display: inline-flex; align-items: center; border-radius: 9999px; font-weight: 500; }
  .uds-badge--sm { padding: 2px 8px; font-size: 0.75rem; height: 20px; }
  .uds-badge--md { padding: 2px 10px; font-size: 0.875rem; height: 24px; }
  .uds-badge--default { background: var(--color-bg-tertiary); color: var(--color-text-primary); }
  .uds-badge--brand { background: color-mix(in srgb, var(--color-brand-primary) 10%, transparent); color: var(--color-brand-primary); }
  .uds-badge--success { background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); }
  .uds-badge--warning { background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning); }
  .uds-badge--error { background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
  .uds-badge__remove { margin-left: 4px; opacity: 0.7; background: none; border: none; color: currentColor; cursor: pointer; }
  .uds-badge__remove:hover { opacity: 1; }
</style>''',
        "tabs": '''<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tabs = [],
    defaultTab = '',
    variant = 'line',
    onchange,
    children,
  }: {
    tabs?: { id: string; label: string; disabled?: boolean }[];
    defaultTab?: string;
    variant?: 'line' | 'pill' | 'segmented';
    onchange?: (tabId: string) => void;
    children?: Snippet<[string]>;
  } = $props();

  let active = $state(defaultTab || tabs[0]?.id || '');

  function select(id: string) {
    active = id;
    onchange?.(id);
  }
</script>

<div class="uds-tabs">
  <div role="tablist" class="uds-tabs__list uds-tabs__list--{variant}" aria-label="Tabs">
    {#each tabs as tab (tab.id)}
      <button
        role="tab"
        id="tab-{tab.id}"
        aria-selected={active === tab.id}
        aria-controls="panel-{tab.id}"
        disabled={tab.disabled}
        class="uds-tabs__tab"
        class:uds-tabs__tab--active={active === tab.id}
        onclick={() => select(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  {#each tabs as tab (tab.id)}
    <div
      role="tabpanel"
      id="panel-{tab.id}"
      aria-labelledby="tab-{tab.id}"
      hidden={active !== tab.id}
      class="uds-tabs__panel"
    >
      {#if active === tab.id}
        {@render children?.(tab.id)}
      {/if}
    </div>
  {/each}
</div>

<style>
  .uds-tabs__list--line { display: flex; border-bottom: 1px solid var(--color-border-default); }
  .uds-tabs__list--pill { display: flex; gap: 4px; border-radius: var(--radius-lg); background: var(--color-bg-secondary); padding: 4px; }
  .uds-tabs__list--segmented { display: flex; border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
  .uds-tabs__tab {
    padding: 8px 16px; font-size: 0.875rem; font-weight: 500;
    color: var(--color-text-secondary); background: none; border: none; cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
  }
  .uds-tabs__tab:hover { color: var(--color-text-primary); }
  .uds-tabs__tab--active { color: var(--color-brand-primary); border-bottom: 2px solid var(--color-brand-primary); }
  .uds-tabs__tab:disabled { opacity: 0.5; pointer-events: none; }
  .uds-tabs__panel { margin-top: var(--space-4); }
</style>''',
        "data-table": '''<script lang="ts">
  let {
    columns = [],
    data = [],
    density = 'default',
    onsort,
  }: {
    columns?: { key: string; header: string; sortable?: boolean }[];
    data?: Record<string, unknown>[];
    density?: 'compact' | 'default' | 'comfortable';
    onsort?: (key: string, direction: 'asc' | 'desc') => void;
  } = $props();
</script>

<div class="uds-data-table uds-data-table--{density}">
  <table role="table">
    <thead>
      <tr>
        {#each columns as col (col.key)}
          <th
            scope="col"
            class="uds-data-table__th"
            aria-sort={col.sortable ? 'none' : undefined}
            onclick={col.sortable ? () => onsort?.(col.key, 'asc') : undefined}
          >
            {col.header}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row, i (i)}
        <tr class="uds-data-table__row">
          {#each columns as col (col.key)}
            <td class="uds-data-table__td">{row[col.key] ?? ''}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .uds-data-table { overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
  .uds-data-table table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .uds-data-table thead { background: var(--color-bg-secondary); }
  .uds-data-table__th { padding: 12px 16px; text-align: left; font-weight: 500; color: var(--color-text-secondary); }
  .uds-data-table__td { padding: 12px 16px; color: var(--color-text-primary); }
  .uds-data-table__row { background: var(--color-bg-primary); border-top: 1px solid var(--color-border-default); }
  .uds-data-table__row:hover { background: var(--color-bg-secondary); }
  .uds-data-table--compact .uds-data-table__th,
  .uds-data-table--compact .uds-data-table__td { padding: 4px 16px; }
  .uds-data-table--comfortable .uds-data-table__th,
  .uds-data-table--comfortable .uds-data-table__td { padding: 16px; }
</style>''',
        "select": '''<script lang="ts">
  let {
    value = $bindable(''),
    label = '',
    options = [],
    error = '',
    placeholder = '',
    size = 'md',
    disabled = false,
    ...restProps
  }: {
    value?: string;
    label?: string;
    options?: { value: string; label: string; disabled?: boolean }[];
    error?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    [key: string]: unknown;
  } = $props();

  const selectId = label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined;
</script>

<div class="uds-select">
  {#if label}
    <label for={selectId} class="uds-select__label">{label}</label>
  {/if}
  <select
    id={selectId}
    bind:value
    {disabled}
    class="uds-select__field uds-select__field--{size}"
    class:uds-select__field--error={!!error}
    aria-invalid={error ? 'true' : undefined}
    {...restProps}
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as opt (opt.value)}
      <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
    {/each}
  </select>
  {#if error}
    <p class="uds-select__error">{error}</p>
  {/if}
</div>

<style>
  .uds-select { display: flex; flex-direction: column; gap: 6px; }
  .uds-select__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
  .uds-select__field {
    width: 100%; appearance: none;
    border-radius: var(--radius-md); border: 1px solid var(--color-border-input);
    background: var(--color-bg-primary); padding: 0 12px;
    color: var(--color-text-primary); transition: border-color var(--duration-fast) var(--ease-out);
  }
  .uds-select__field:focus { border-color: var(--color-brand-primary); outline: none; box-shadow: 0 0 0 2px rgba(var(--color-brand-primary), 0.2); }
  .uds-select__field:disabled { opacity: 0.5; cursor: not-allowed; }
  .uds-select__field--sm { height: 36px; font-size: 0.875rem; }
  .uds-select__field--md { height: 44px; }
  .uds-select__field--lg { height: 52px; font-size: 1.125rem; }
  .uds-select__field--error { border-color: var(--color-error); }
  .uds-select__error { font-size: 0.875rem; color: var(--color-error); }
</style>''',
        "accordion": '''<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    items = [],
    allowMultiple = false,
    defaultExpanded = [],
    variant = 'single',
    children,
  }: {
    items?: { id: string; title: string }[];
    allowMultiple?: boolean;
    defaultExpanded?: string[];
    variant?: 'single' | 'multi' | 'flush';
    children?: Snippet<[string]>;
  } = $props();

  let expanded: Set<string> = $state(new Set(defaultExpanded));

  function toggle(id: string) {
    const next = new Set(allowMultiple ? expanded : []);
    if (expanded.has(id)) next.delete(id);
    else next.add(id);
    expanded = next;
  }
</script>

<div class="uds-accordion uds-accordion--{variant}">
  {#each items as item (item.id)}
    <div class="uds-accordion__item">
      <button
        aria-expanded={expanded.has(item.id)}
        aria-controls="accordion-panel-{item.id}"
        class="uds-accordion__trigger"
        onclick={() => toggle(item.id)}
      >
        {item.title}
        <span class="uds-accordion__icon" class:uds-accordion__icon--open={expanded.has(item.id)} aria-hidden="true">&#9662;</span>
      </button>
      {#if expanded.has(item.id)}
        <div
          id="accordion-panel-{item.id}"
          role="region"
          class="uds-accordion__panel"
        >
          {@render children?.(item.id)}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .uds-accordion { border-radius: var(--radius-md); border: 1px solid var(--color-border-default); }
  .uds-accordion--flush { border: none; border-radius: 0; }
  .uds-accordion__item { border-top: 1px solid var(--color-border-default); }
  .uds-accordion__item:first-child { border-top: none; }
  .uds-accordion__trigger {
    display: flex; width: 100%; align-items: center; justify-content: space-between;
    padding: 12px 16px; text-align: left; font-weight: 500;
    color: var(--color-text-primary); background: none; border: none; cursor: pointer;
  }
  .uds-accordion__trigger:hover { background: var(--color-bg-secondary); }
  .uds-accordion__icon { transition: transform var(--duration-fast) var(--ease-out); }
  .uds-accordion__icon--open { transform: rotate(180deg); }
  .uds-accordion__panel { padding: 0 16px 16px; font-size: 0.875rem; color: var(--color-text-secondary); }
</style>''',
        "stack": '''<script lang="ts">
  let { gap = 'md', children, ...restProps }: {
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="uds-stack" style="gap: var(--layout-stack-gap-{gap})" {...restProps}>
  {@render children?.()}
</div>

<style>
  .uds-stack { display: flex; flex-direction: column; }
</style>''',
        "grid": '''<script lang="ts">
  let { columns = 3, gap = 'md', children, ...restProps }: {
    columns?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div
  class="uds-grid"
  style="grid-template-columns: repeat({columns}, 1fr); gap: var(--layout-stack-gap-{gap})"
  {...restProps}
>
  {@render children?.()}
</div>

<style>
  .uds-grid { display: grid; container-type: inline-size; }
</style>''',
    },
    "web-components": {
        "button": '''import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uds-button')
export class UdsButton extends LitElement {
  static styles = css\`
    :host {
      display: inline-flex;
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-brand-primary);
      color: var(--color-text-on-brand);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      border: none;
      font-family: var(--font-body);
      font-size: var(--font-size-md);
      font-weight: 500;
      cursor: pointer;
      transition: opacity var(--duration-fast) var(--easing-standard);
    }
    button:hover { opacity: 0.9; }
    button:focus-visible {
      outline: 2px solid var(--color-brand-primary);
      outline-offset: 2px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
    button.ghost {
      background: transparent;
      color: var(--color-brand-primary);
    }
    button.destructive {
      background: var(--color-error);
      color: white;
    }
    button.sm { height: 36px; padding: 0 12px; font-size: 0.875rem; }
    button.md { height: 44px; padding: 0 16px; }
    button.lg { height: 48px; padding: 0 24px; font-size: 1.125rem; }
  \`;

  @property({ type: String }) variant = 'primary';
  @property({ type: String }) size = 'md';
  @property({ type: Boolean }) disabled = false;

  render() {
    return html\`
      <button
        class=\${[this.variant, this.size].join(' ')}
        ?disabled=\${this.disabled}
        part="button"
      >
        <slot></slot>
      </button>
    \`;
  }
}''',
        "card": '''import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uds-card')
export class UdsCard extends LitElement {
  static styles = css\`
    :host {
      display: block;
    }
    .card {
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-default);
      background: var(--color-bg-primary);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }
    .card__header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border-default);
    }
    .card__content {
      padding: var(--space-6);
      color: var(--color-text-secondary);
    }
    .card__footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border-default);
    }
    .card__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
  \`;

  @property({ type: String }) heading = '';

  render() {
    return html\`
      <div class="card" part="card">
        \${this.heading ? html\`
          <div class="card__header" part="header">
            <h3 class="card__title">\${this.heading}</h3>
          </div>
        \` : ''}
        <div class="card__content" part="content">
          <slot></slot>
        </div>
        <div class="card__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    \`;
  }
}''',
        "input": '''import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uds-input')
export class UdsInput extends LitElement {
  static styles = css\`
    :host {
      display: block;
    }
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    input {
      width: 100%;
      box-sizing: border-box;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-input);
      background: var(--color-bg-primary);
      padding: 8px 12px;
      font-size: 0.875rem;
      font-family: var(--font-body);
      color: var(--color-text-primary);
      transition: border-color var(--duration-fast) var(--easing-standard);
    }
    input::placeholder {
      color: var(--color-text-tertiary);
    }
    input:focus {
      border-color: var(--color-brand-primary);
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand-primary) 20%, transparent);
    }
    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    input[aria-invalid="true"] {
      border-color: var(--color-error);
    }
    .error {
      font-size: 0.875rem;
      color: var(--color-error);
      margin: 0;
    }
  \`;

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) type = 'text';
  @property({ type: String }) error = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;

  private _handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(new CustomEvent('uds-input', {
      detail: { value: input.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const inputId = this.label
      ? this.label.toLowerCase().replace(/\\s+/g, '-')
      : undefined;

    return html\`
      <div class="input-wrapper">
        \${this.label ? html\`<label for=\${inputId} part="label">\${this.label}</label>\` : ''}
        <input
          id=\${inputId || ''}
          type=\${this.type}
          .value=\${this.value}
          placeholder=\${this.placeholder}
          ?disabled=\${this.disabled}
          ?required=\${this.required}
          aria-invalid=\${this.error ? 'true' : 'false'}
          part="input"
          @input=\${this._handleInput}
        />
        \${this.error ? html\`<p class="error" role="alert" part="error">\${this.error}</p>\` : ''}
      </div>
    \`;
  }
}''',
        "modal": '''import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uds-modal')
export class UdsModal extends LitElement {
  static styles = css\`
    :host {
      display: contents;
    }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .panel {
      position: relative;
      width: 100%;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-default);
      background: var(--color-bg-primary);
      padding: var(--space-6);
      box-shadow: var(--shadow-xl);
    }
    .panel--sm { max-width: 400px; }
    .panel--md { max-width: 560px; }
    .panel--lg { max-width: 720px; }
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .body {
      margin-top: var(--space-4);
      color: var(--color-text-secondary);
    }
    .actions {
      margin-top: var(--space-6);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  \`;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) heading = '';
  @property({ type: String }) size: 'sm' | 'md' | 'lg' = 'md';

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close();
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('uds-close', {
      bubbles: true,
      composed: true,
    }));
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
      panel?.focus();
    }
  }

  render() {
    if (!this.open) return html\`\`;

    return html\`
      <div class="overlay">
        <div class="backdrop" @click=\${this._close} aria-hidden="true"></div>
        <div
          class="panel panel--\${this.size}"
          role="dialog"
          aria-modal="true"
          aria-label=\${this.heading}
          tabindex="-1"
          part="panel"
        >
          <h2 class="title">\${this.heading}</h2>
          <div class="body" part="body">
            <slot></slot>
          </div>
          <div class="actions" part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    \`;
  }
}''',
        "tabs": '''import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface UdsTab {
  id: string;
  label: string;
  disabled?: boolean;
}

@customElement('uds-tabs')
export class UdsTabs extends LitElement {
  static styles = css\`
    :host {
      display: block;
    }
    .tablist {
      display: flex;
      border-bottom: 1px solid var(--color-border-default);
    }
    .tablist--pill {
      border-bottom: none;
      gap: 4px;
      border-radius: var(--radius-lg);
      background: var(--color-bg-secondary);
      padding: 4px;
    }
    .tab {
      padding: 8px 16px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      transition: color var(--duration-fast) var(--easing-standard);
      font-family: var(--font-body);
    }
    .tab:hover {
      color: var(--color-text-primary);
    }
    .tab[aria-selected="true"] {
      color: var(--color-brand-primary);
      border-bottom: 2px solid var(--color-brand-primary);
    }
    .tab:focus-visible {
      outline: 2px solid var(--color-brand-primary);
      outline-offset: -2px;
    }
    .tab:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    .panel {
      margin-top: var(--space-4);
    }
  \`;

  @property({ type: Array }) tabs: UdsTab[] = [];
  @property({ type: String }) variant: 'line' | 'pill' = 'line';
  @state() private _activeTab = '';

  firstUpdated() {
    if (!this._activeTab && this.tabs.length > 0) {
      this._activeTab = this.tabs[0].id;
    }
  }

  private _selectTab(id: string) {
    this._activeTab = id;
    this.dispatchEvent(new CustomEvent('uds-tab-change', {
      detail: { tab: id },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleKeydown(e: KeyboardEvent) {
    const enabledTabs = this.tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === this._activeTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % enabledTabs.length;
    else if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    else if (e.key === 'Home') newIndex = 0;
    else if (e.key === 'End') newIndex = enabledTabs.length - 1;
    else return;

    e.preventDefault();
    this._selectTab(enabledTabs[newIndex].id);
    const btn = this.shadowRoot?.querySelector(\`[data-tab-id="\${enabledTabs[newIndex].id}"]\`) as HTMLElement;
    btn?.focus();
  }

  render() {
    const listClass = this.variant === 'pill' ? 'tablist tablist--pill' : 'tablist';

    return html\`
      <div
        class=\${listClass}
        role="tablist"
        aria-label="Tabs"
        @keydown=\${this._handleKeydown}
      >
        \${this.tabs.map(tab => html\`
          <button
            role="tab"
            id="tab-\${tab.id}"
            data-tab-id=\${tab.id}
            aria-selected=\${this._activeTab === tab.id}
            aria-controls="panel-\${tab.id}"
            ?disabled=\${tab.disabled}
            tabindex=\${this._activeTab === tab.id ? 0 : -1}
            class="tab"
            @click=\${() => this._selectTab(tab.id)}
          >
            \${tab.label}
          </button>
        \`)}
      </div>
      \${this.tabs.map(tab => html\`
        <div
          role="tabpanel"
          id="panel-\${tab.id}"
          aria-labelledby="tab-\${tab.id}"
          ?hidden=\${this._activeTab !== tab.id}
          class="panel"
          part="panel"
        >
          <slot name=\${tab.id}></slot>
        </div>
      \`)}
    \`;
  }
}''',
        "alert": '''import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uds-alert')
export class UdsAlert extends LitElement {
  static styles = css\`
    :host {
      display: block;
    }
    .alert {
      display: flex;
      gap: 12px;
      border-radius: var(--radius-md);
      border: 1px solid;
      padding: var(--space-4);
    }
    .alert--info {
      border-color: var(--color-info);
      background: color-mix(in srgb, var(--color-info) 10%, transparent);
      color: var(--color-info);
    }
    .alert--success {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 10%, transparent);
      color: var(--color-success);
    }
    .alert--warning {
      border-color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning) 10%, transparent);
      color: var(--color-warning);
    }
    .alert--error {
      border-color: var(--color-error);
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
      color: var(--color-error);
    }
    .content { flex: 1; }
    .title {
      font-weight: 600;
      margin: 0;
    }
    .message {
      font-size: 0.875rem;
    }
    .dismiss {
      align-self: flex-start;
      opacity: 0.7;
      background: none;
      border: none;
      color: currentColor;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      line-height: 1;
    }
    .dismiss:hover { opacity: 1; }
  \`;

  @property({ type: String }) variant: 'info' | 'success' | 'warning' | 'error' = 'info';
  @property({ type: String }) heading = '';
  @property({ type: Boolean }) dismissible = false;

  private _dismiss() {
    this.dispatchEvent(new CustomEvent('uds-dismiss', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const role = this.variant === 'error' || this.variant === 'warning'
      ? 'alert'
      : 'status';

    return html\`
      <div class="alert alert--\${this.variant}" role=\${role} part="alert">
        <div class="content">
          \${this.heading ? html\`<p class="title">\${this.heading}</p>\` : ''}
          <div class="message"><slot></slot></div>
        </div>
        \${this.dismissible ? html\`
          <button
            class="dismiss"
            @click=\${this._dismiss}
            aria-label="Dismiss"
          >&times;</button>
        \` : ''}
      </div>
    \`;
  }
}''',
        "accordion": '''import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface AccordionItem {
  id: string;
  title: string;
}

@customElement('uds-accordion')
export class UdsAccordion extends LitElement {
  static styles = css\`
    :host {
      display: block;
    }
    .accordion {
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-default);
    }
    .accordion--flush {
      border: none;
      border-radius: 0;
    }
    .item {
      border-top: 1px solid var(--color-border-default);
    }
    .item:first-child {
      border-top: none;
    }
    .trigger {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      text-align: left;
      font-weight: 500;
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-text-primary);
      background: none;
      border: none;
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--color-bg-secondary);
    }
    .trigger:focus-visible {
      outline: 2px solid var(--color-brand-primary);
      outline-offset: -2px;
    }
    .icon {
      transition: transform var(--duration-fast) var(--easing-standard);
    }
    .icon--open {
      transform: rotate(180deg);
    }
    .panel {
      padding: 0 16px 16px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  \`;

  @property({ type: Array }) items: AccordionItem[] = [];
  @property({ type: Boolean }) allowMultiple = false;
  @property({ type: String }) variant: 'single' | 'multi' | 'flush' = 'single';
  @state() private _expanded: Set<string> = new Set();

  private _toggle(id: string) {
    const next = new Set(this.allowMultiple ? this._expanded : []);
    if (this._expanded.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this._expanded = next;
    this.dispatchEvent(new CustomEvent('uds-toggle', {
      detail: { id, expanded: next.has(id) },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const accClass = this.variant === 'flush'
      ? 'accordion accordion--flush'
      : 'accordion';

    return html\`
      <div class=\${accClass} part="accordion">
        \${this.items.map(item => {
          const isOpen = this._expanded.has(item.id);
          return html\`
            <div class="item">
              <button
                class="trigger"
                aria-expanded=\${isOpen}
                aria-controls="accordion-panel-\${item.id}"
                @click=\${() => this._toggle(item.id)}
              >
                \${item.title}
                <span class="icon \${isOpen ? 'icon--open' : ''}" aria-hidden="true">&#9662;</span>
              </button>
              \${isOpen ? html\`
                <div
                  id="accordion-panel-\${item.id}"
                  role="region"
                  aria-labelledby="accordion-trigger-\${item.id}"
                  class="panel"
                  part="panel"
                >
                  <slot name=\${item.id}></slot>
                </div>
              \` : ''}
            </div>
          \`;
        })}
      </div>
    \`;
  }
}''',
        "tooltip": '''import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('uds-tooltip')
export class UdsTooltip extends LitElement {
  static styles = css\`
    :host {
      display: inline-block;
      position: relative;
    }
    .trigger {
      display: inline-block;
    }
    .tooltip {
      position: absolute;
      z-index: 50;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      background: var(--color-text-primary);
      color: var(--color-bg-primary);
      font-size: 0.75rem;
      font-family: var(--font-body);
      line-height: 1.4;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--duration-fast) var(--easing-standard);
    }
    .tooltip--visible {
      opacity: 1;
    }
    .tooltip--top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 6px;
    }
    .tooltip--bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 6px;
    }
    .tooltip--left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 6px;
    }
    .tooltip--right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 6px;
    }
  \`;

  @property({ type: String }) content = '';
  @property({ type: String }) placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @state() private _visible = false;

  private _show() { this._visible = true; }
  private _hide() { this._visible = false; }

  render() {
    const tooltipClass = [
      'tooltip',
      \`tooltip--\${this.placement}\`,
      this._visible ? 'tooltip--visible' : '',
    ].join(' ');

    return html\`
      <div
        class="trigger"
        @mouseenter=\${this._show}
        @mouseleave=\${this._hide}
        @focusin=\${this._show}
        @focusout=\${this._hide}
        aria-describedby="tooltip"
      >
        <slot></slot>
      </div>
      <div
        id="tooltip"
        class=\${tooltipClass}
        role="tooltip"
        part="tooltip"
      >
        \${this.content}
      </div>
    \`;
  }
}''',
    },
}

# Mapping from CSV component slugs to template keys.
# Allows the generator to match BM25 search results to available templates.
UNSTYLED_TEMPLATES = {
    "button": {
        "element": "button",
        "aria": {"role": "button", "aria-disabled": "false"},
        "keyboard": ["Enter: activate", "Space: activate"],
        "states": ["default", "hover", "focus", "active", "disabled"],
        "focus": "Focusable by default. Use tabindex=-1 to remove from tab order.",
    },
    "modal": {
        "element": "dialog",
        "aria": {
            "role": "dialog",
            "aria-modal": "true",
            "aria-labelledby": "{title-id}",
        },
        "keyboard": ["Escape: close dialog", "Tab: cycle focus within modal"],
        "states": ["open", "closed"],
        "focus": "Trap focus within modal when open. Move focus to first focusable element on open. Return focus to trigger element on close.",
    },
    "tabs": {
        "element": "div",
        "aria": {
            "role": "tablist (container), tab (trigger), tabpanel (content)",
            "aria-selected": "true/false on each tab",
            "aria-controls": "tab references its panel id",
            "aria-labelledby": "panel references its tab id",
        },
        "keyboard": [
            "ArrowLeft: activate previous tab",
            "ArrowRight: activate next tab",
            "Home: activate first tab",
            "End: activate last tab",
        ],
        "states": ["active", "inactive", "disabled"],
        "focus": "Only the active tab is in the tab order (tabindex=0). Inactive tabs have tabindex=-1. Arrow keys move focus between tabs.",
    },
    "input": {
        "element": "input",
        "aria": {
            "aria-invalid": "true when validation fails",
            "aria-describedby": "{error-message-id} when error is present",
            "aria-required": "true when field is required",
        },
        "keyboard": ["Tab: move focus in/out"],
        "states": ["default", "focus", "filled", "disabled", "readonly", "invalid"],
        "focus": "Focusable by default. Associate label via for/id or aria-labelledby. Error messages linked via aria-describedby.",
    },
    "card": {
        "element": "article or div",
        "aria": {
            "role": "article (if standalone) or group (if in a list)",
        },
        "keyboard": ["Tab: move focus to interactive children within the card"],
        "states": ["default", "interactive (if clickable)"],
        "focus": "Not focusable by default unless the card is interactive. If clickable, add tabindex=0 and role=button or use an anchor wrapper.",
    },
    "alert": {
        "element": "div",
        "aria": {
            "role": "alert (for errors/warnings) or status (for info/success)",
            "aria-live": "assertive (errors) or polite (info/success)",
            "aria-atomic": "true",
        },
        "keyboard": ["Tab: move focus to dismiss button if present"],
        "states": ["visible", "dismissed"],
        "focus": "Not focusable by default. Dismiss button (if present) is focusable. Use aria-live to announce dynamic alerts to screen readers.",
    },
    "accordion": {
        "element": "div",
        "aria": {
            "aria-expanded": "true/false on each trigger button",
            "aria-controls": "trigger references its panel id",
            "role": "region on each panel",
            "aria-labelledby": "panel references its trigger id",
        },
        "keyboard": [
            "Enter: toggle section",
            "Space: toggle section",
            "ArrowDown: move focus to next header",
            "ArrowUp: move focus to previous header",
            "Home: move focus to first header",
            "End: move focus to last header",
        ],
        "states": ["expanded", "collapsed", "disabled"],
        "focus": "Each accordion header button is focusable. Panel content enters the tab order when expanded.",
    },
    "tooltip": {
        "element": "div (popover)",
        "aria": {
            "role": "tooltip",
            "aria-describedby": "trigger references tooltip id",
        },
        "keyboard": ["Escape: dismiss tooltip", "Focus/hover on trigger: show tooltip"],
        "states": ["hidden", "visible"],
        "focus": "Tooltip itself is not focusable. Trigger element must be focusable. Show on focus and hover, dismiss on Escape and blur.",
    },
    "dropdown": {
        "element": "div (menu container)",
        "aria": {
            "role": "menu (container), menuitem (option)",
            "aria-expanded": "true/false on trigger",
            "aria-haspopup": "true on trigger",
            "aria-activedescendant": "id of focused menuitem",
        },
        "keyboard": [
            "Enter/Space: open menu, activate item",
            "ArrowDown: move to next item",
            "ArrowUp: move to previous item",
            "Escape: close menu",
            "Home: move to first item",
            "End: move to last item",
        ],
        "states": ["open", "closed"],
        "focus": "Trigger is focusable. When menu opens, focus moves to first item. On close, return focus to trigger. Use aria-activedescendant for virtual focus.",
    },
    "toggle": {
        "element": "button",
        "aria": {
            "role": "switch",
            "aria-checked": "true/false",
            "aria-labelledby": "{label-id}",
        },
        "keyboard": ["Enter: toggle state", "Space: toggle state"],
        "states": ["on", "off", "disabled"],
        "focus": "Focusable by default. Announce state changes via aria-checked. Pair with a visible label via aria-labelledby.",
    },
    "badge": {
        "element": "span",
        "aria": {
            "role": "status (if dynamic count)",
            "aria-label": "descriptive text when badge is icon-only",
        },
        "keyboard": ["Not interactive by default. If removable, Tab to remove button."],
        "states": ["default", "removable"],
        "focus": "Not focusable by default. If a remove button is present, it is focusable. Use aria-live=polite for dynamically updating counts.",
    },
    "avatar": {
        "element": "img or span (fallback)",
        "aria": {
            "role": "img",
            "alt": "descriptive text for the person/entity",
            "aria-label": "used when no alt text is available on fallback",
        },
        "keyboard": ["Not interactive by default. If clickable, Tab to focus."],
        "states": ["image-loaded", "fallback-initials", "fallback-icon"],
        "focus": "Not focusable by default. If the avatar is a link or button, it inherits focus from the interactive wrapper.",
    },
}

SLUG_TO_TEMPLATE = {
    "button": "button",
    "btn": "button",
    "card": "card",
    "feature-card": "card",
    "input": "input",
    "modal": "modal",
    "alert": "alert",
    "badge": "badge",
    "tabs": "tabs",
    "data-table": "data-table",
    "select": "select",
    "accordion": "accordion",
    "stack": "stack",
    "grid": "grid",
    "tooltip": "tooltip",
}

PALETTE_DISPLAY_NAMES = {
    "minimal-saas": "Minimal SaaS",
    "ai-futuristic": "AI Futuristic",
    "gradient-startup": "Gradient Startup",
    "corporate": "Corporate",
    "apple-minimal": "Apple Minimal",
    "illustration": "Illustration",
    "dashboard": "Dashboard",
    "bold-lifestyle": "Bold Lifestyle",
    "minimal-corporate": "Minimal Corporate",
}

# Add custom palettes from registry
if get_custom_palette_names:
    for name in get_custom_palette_names():
        if name not in PALETTE_DISPLAY_NAMES:
            display = " ".join(w.capitalize() for w in name.split("-"))
            PALETTE_DISPLAY_NAMES[name] = display


def load_tokens() -> dict:
    """Load the design tokens JSON file."""
    if TOKENS_PATH.exists():
        with open(TOKENS_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _resolve_reference(tokens: dict, ref: str) -> str:
    """Resolve a DTCG token reference like {color.primitive.blue.600}."""
    if not ref.startswith("{") or not ref.endswith("}"):
        return ref
    path = ref[1:-1].split(".")
    current = tokens
    for part in path:
        if isinstance(current, dict):
            current = current.get(part, {})
        else:
            return ref
    if isinstance(current, dict) and "$value" in current:
        return current["$value"]
    return ref


def _format_shadow_value(layers) -> str:
    """Convert DTCG shadow token (list of layer dicts) to CSS box-shadow string.

    Each layer: {"color": "rgba(...)", "offsetX": "0px", "offsetY": "2px",
                 "blur": "4px", "spread": "0px"}
    Multi-layer shadows are joined with ', '.
    If the value is already a plain string, return it as-is.
    """
    if isinstance(layers, str):
        return layers
    if not isinstance(layers, list):
        return str(layers)
    parts = []
    for layer in layers:
        if isinstance(layer, dict):
            parts.append(
                f"{layer.get('offsetX', '0px')} {layer.get('offsetY', '0px')} "
                f"{layer.get('blur', '0px')} {layer.get('spread', '0px')} "
                f"{layer.get('color', 'rgba(0,0,0,0.1)')}"
            )
        elif isinstance(layer, str):
            parts.append(layer)
    return ", ".join(parts) if parts else "none"


def resolve_foundation_tokens(tokens: dict) -> dict:
    """Extract all foundation (non-palette) tokens from design-tokens.json.

    Returns a dict with keys: spacing, shadow, radius, motion_duration,
    motion_easing, font_family, font_size, font_weight, opacity, z_index.
    """
    result = {}

    # --- spacing (13 values) ---
    spacing_raw = tokens.get("spacing", {})
    result["spacing"] = {
        k: v["$value"]
        for k, v in spacing_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- shadow (6 levels) — convert DTCG arrays to CSS strings ---
    shadow_raw = tokens.get("shadow", {})
    result["shadow"] = {}
    for k, v in shadow_raw.items():
        if k.startswith("$") or k == "palette-overrides":
            continue
        if isinstance(v, dict) and "$value" in v:
            result["shadow"][k] = _format_shadow_value(v["$value"])

    # --- radius (foundation defaults) ---
    radius_raw = tokens.get("radius", {})
    result["radius"] = {
        k: v["$value"]
        for k, v in radius_raw.items()
        if not k.startswith("$") and k != "palette-overrides"
        and isinstance(v, dict) and "$value" in v
    }

    # --- motion.duration ---
    motion = tokens.get("motion", {})
    dur_raw = motion.get("duration", {})
    result["motion_duration"] = {
        k: v["$value"]
        for k, v in dur_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- motion.easing (cubicBezier → CSS string) ---
    ease_raw = motion.get("easing", {})
    result["motion_easing"] = {}
    for k, v in ease_raw.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "$value" in v:
            vals = v["$value"]
            if isinstance(vals, list) and len(vals) == 4:
                result["motion_easing"][k] = (
                    f"cubic-bezier({vals[0]}, {vals[1]}, {vals[2]}, {vals[3]})"
                )

    # --- typography.fontFamily (4 stacks) ---
    typo = tokens.get("typography", {})
    ff_raw = typo.get("fontFamily", {})
    result["font_family"] = {}
    for k, v in ff_raw.items():
        if k.startswith("$") or k == "palette-overrides":
            continue
        if isinstance(v, dict) and "$value" in v:
            val = v["$value"]
            if isinstance(val, list):
                result["font_family"][k] = ", ".join(val)
            else:
                result["font_family"][k] = str(val)

    # --- typography.fontSize (10 values) ---
    fs_raw = typo.get("fontSize", {})
    result["font_size"] = {
        k: v["$value"]
        for k, v in fs_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- typography.fontWeight (5 values) ---
    fw_raw = typo.get("fontWeight", {})
    result["font_weight"] = {
        k: str(v["$value"])
        for k, v in fw_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- opacity (4 values) ---
    op_raw = tokens.get("opacity", {})
    result["opacity"] = {
        k: str(v["$value"])
        for k, v in op_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- zIndex (7 values) ---
    zi_raw = tokens.get("zIndex", {})
    result["z_index"] = {
        k: str(v["$value"])
        for k, v in zi_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    return result


def resolve_palette_tokens(tokens: dict, palette: str) -> dict:
    """Extract token values for a specific palette from design-tokens.json."""
    theme_data = tokens.get("theme", {}).get(palette, {})
    if not theme_data:
        return {}

    resolved = {}

    def _categorize(key: str, raw):
        """Map a token key to the correct CSS custom property."""
        if key.startswith(("bg", "text", "brand", "border", "status", "error", "success", "warning", "info")):
            css_key = key.replace("_", "-")
            resolved[f"--color-{css_key}"] = raw
        elif key.startswith("shadow"):
            resolved[f"--shadow-{key.replace('_', '-')}"] = raw
        elif key.startswith("radius"):
            resolved[f"--radius-{key.replace('_', '-')}"] = raw
        elif key.startswith("font"):
            resolved[f"--{key.replace('_', '-')}"] = raw
        else:
            css_key = key.replace("_", "-")
            resolved[f"--color-{css_key}"] = raw

    # Detect format: newer palettes have "light"/"dark" sub-dicts
    if "light" in theme_data and isinstance(theme_data["light"], dict):
        # Newer format: light/dark sub-objects with hyphenated keys
        light = theme_data.get("light", {})
        for key, val in light.items():
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
                if isinstance(raw, str) and raw.startswith("{"):
                    raw = _resolve_reference(tokens, raw)
                _categorize(key, raw)

        # Process structural tokens (radius, shadow, font-display)
        structural = theme_data.get("$structural", {})
        for key, val in structural.items():
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
            elif isinstance(val, str):
                raw = val
            else:
                continue
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            if key != "shape":
                _categorize(key, raw)
    else:
        # Older format: flat underscore keys (bg_primary, text_primary_dark, etc.)
        for key, val in theme_data.items():
            if key.startswith("$"):
                continue
            # Skip dark-mode tokens (use light only for output)
            if key.endswith("_dark"):
                continue
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
            elif isinstance(val, str):
                raw = val
            else:
                continue
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            _categorize(key, raw)

    return resolved


def _to_camel(kebab: str) -> str:
    """Convert a kebab-case string to camelCase."""
    parts = kebab.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _classify_palette_tokens(palette_tokens: dict) -> dict:
    """Classify palette tokens into colors, shadows, radii, and font_display.

    Returns a dict with keys: colors, shadows, radii, font_display.
    Colors is a dict of group -> {name: value}, where value is the raw
    resolved value from palette_tokens.
    """
    colors: dict = {}
    shadows: dict = {}
    radii: dict = {}
    font_display = ""

    for token, value in palette_tokens.items():
        if token.startswith("--color-"):
            parts = token.replace("--color-", "").split("-")
            if len(parts) >= 2:
                group = parts[0]
                name = "-".join(parts[1:])
                if group not in colors:
                    colors[group] = {}
                colors[group][name] = value
            else:
                colors[parts[0]] = value
        elif token.startswith("--shadow-"):
            shadows[token.replace("--shadow-", "")] = value
        elif token.startswith("--radius-"):
            radii[token.replace("--radius-", "")] = value
        elif token == "--font-display":
            font_display = value

    return {
        "colors": colors,
        "shadows": shadows,
        "radii": radii,
        "font_display": font_display,
    }


def generate_tailwind_config(palette_tokens: dict, palette: str,
                             foundation: Optional[dict] = None) -> str:
    """Generate a Tailwind CSS config preset from palette + foundation tokens."""
    foundation = foundation or {}
    classified = _classify_palette_tokens(palette_tokens)
    colors = classified["colors"]
    font_display = classified["font_display"]

    # Merge foundation + palette overrides
    shadows = {**foundation.get("shadow", {}), **classified["shadows"]}
    radii = {**foundation.get("radius", {}), **classified["radii"]}
    spacing = foundation.get("spacing", {})
    durations = foundation.get("motion_duration", {})
    easings = foundation.get("motion_easing", {})
    font_sizes = foundation.get("font_size", {})
    font_weights = foundation.get("font_weight", {})
    opacity = foundation.get("opacity", {})
    z_index = foundation.get("z_index", {})

    # Build font families: foundation stacks + palette display override
    font_families = {}
    for name, stack in foundation.get("font_family", {}).items():
        font_families[name] = [s.strip() for s in stack.split(",")]
    if font_display:
        font_families["display"] = [font_display, "sans-serif"]

    lines = []
    lines.append("// Universal Design System — Tailwind Preset")
    lines.append(f"// Palette: {PALETTE_DISPLAY_NAMES.get(palette, palette)}")
    lines.append("// Generated by: python src/scripts/design_system.py")
    lines.append("")
    lines.append(f"/** @type {{import('tailwindcss').Config}} */")
    lines.append("export default {")
    lines.append("  theme: {")
    lines.append("    extend: {")

    # Colors
    lines.append("      colors: {")
    for group, values in sorted(colors.items()):
        if isinstance(values, dict):
            lines.append(f"        '{group}': {{")
            for name, hex_val in sorted(values.items()):
                lines.append(f"          '{name}': '{hex_val}',")
            lines.append("        },")
        else:
            lines.append(f"        '{group}': '{values}',")
    lines.append("      },")

    # Spacing
    if spacing:
        lines.append("      spacing: {")
        for name, val in sorted(spacing.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Shadows
    if shadows:
        lines.append("      boxShadow: {")
        for name, val in sorted(shadows.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Radii
    if radii:
        lines.append("      borderRadius: {")
        for name, val in sorted(radii.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Transition duration
    if durations:
        lines.append("      transitionDuration: {")
        for name, val in sorted(durations.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Transition timing function
    if easings:
        lines.append("      transitionTimingFunction: {")
        for name, val in sorted(easings.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Font families
    if font_families:
        lines.append("      fontFamily: {")
        for name, stack in sorted(font_families.items()):
            formatted = ", ".join(f"'{s}'" for s in stack)
            lines.append(f"        '{name}': [{formatted}],")
        lines.append("      },")

    # Font sizes
    if font_sizes:
        lines.append("      fontSize: {")
        for name, val in sorted(font_sizes.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Font weights
    if font_weights:
        lines.append("      fontWeight: {")
        for name, val in sorted(font_weights.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Opacity
    if opacity:
        lines.append("      opacity: {")
        for name, val in sorted(opacity.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Z-index
    if z_index:
        lines.append("      zIndex: {")
        for name, val in sorted(z_index.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    lines.append("    },")
    lines.append("  },")
    lines.append("};")

    return "\n".join(lines)


def generate_css_in_js(palette_tokens: dict, palette: str,
                       foundation: Optional[dict] = None) -> str:
    """Generate a CSS-in-JS theme object (ES module) compatible with styled-components and Emotion."""
    foundation = foundation or {}
    display_name = PALETTE_DISPLAY_NAMES.get(palette, palette)
    classified = _classify_palette_tokens(palette_tokens)

    # Build a camelCase version of the color map, keyed by CSS var name
    colors_camel: dict = {}
    for group, values in classified["colors"].items():
        if isinstance(values, dict):
            colors_camel[group] = {
                _to_camel(name): f"--color-{group}-{name}"
                for name in values
            }
        else:
            colors_camel[group] = f"--color-{group}"

    lines = []
    lines.append("// Universal Design System — CSS-in-JS Theme")
    lines.append(f"// Palette: {display_name}")
    lines.append("// Generated by: python src/scripts/design_system.py")
    lines.append("//")
    lines.append("// Compatible with styled-components, Emotion, and any CSS-in-JS library.")
    lines.append("// Tokens reference CSS custom properties so themes can be swapped at runtime")
    lines.append("// by changing the data-theme attribute on the root element.")
    lines.append("")

    lines.append("export const theme = {")

    # --- colors ---
    lines.append("  colors: {")
    # Ensure a stable ordering: brand, text, bg, border, status, then others
    priority_groups = ["brand", "text", "bg", "border", "status"]
    sorted_groups = [g for g in priority_groups if g in colors_camel]
    sorted_groups += sorted(g for g in colors_camel if g not in priority_groups)

    for group in sorted_groups:
        values = colors_camel[group]
        if isinstance(values, dict):
            lines.append(f"    {group}: {{")
            for name, var_name in sorted(values.items()):
                lines.append(f"      {name}: 'var({var_name})',")
            lines.append("    },")
        else:
            lines.append(f"    {group}: 'var({values})',")
    lines.append("  },")

    # --- spacing ---
    spacing = foundation.get("spacing", {})
    if spacing:
        lines.append("  spacing: {")
        for name in sorted(spacing.keys(), key=lambda x: int(x) if x.isdigit() else 0):
            lines.append(f"    '{name}': 'var(--space-{name})',")
        lines.append("  },")

    # --- shadows (merge foundation + palette overrides) ---
    shadows = {**foundation.get("shadow", {}), **classified["shadows"]}
    if shadows:
        lines.append("  shadows: {")
        for name in sorted(shadows.keys()):
            lines.append(f"    {name}: 'var(--shadow-{name})',")
        lines.append("  },")

    # --- radii (merge foundation + palette overrides) ---
    radii = {**foundation.get("radius", {}), **classified["radii"]}
    if radii:
        lines.append("  radii: {")
        for name in sorted(radii.keys()):
            lines.append(f"    {name}: 'var(--radius-{name})',")
        lines.append("  },")

    # --- typography ---
    font_families = foundation.get("font_family", {})
    font_sizes = foundation.get("font_size", {})
    if font_families or font_sizes:
        lines.append("  typography: {")
        if font_families:
            lines.append("    fontFamily: {")
            for name in sorted(font_families.keys()):
                lines.append(f"      {name}: 'var(--font-family-{name})',")
            lines.append("    },")
        if font_sizes:
            lines.append("    fontSize: {")
            for name in sorted(font_sizes.keys()):
                lines.append(f"      '{name}': 'var(--font-size-{name})',")
            lines.append("    },")
        lines.append("  },")

    lines.append("};")

    # --- usage examples ---
    lines.append("""
// ---------------------------------------------------------------------------
// Usage with styled-components
// ---------------------------------------------------------------------------
//
// import styled from 'styled-components';
// import { theme } from './theme';
//
// const Button = styled.button`
//   background: ${theme.colors.brand.primary};
//   color: ${theme.colors.text.primary};
//   padding: ${theme.spacing['2']} ${theme.spacing['4']};
//   border-radius: ${theme.radii.md};
//   box-shadow: ${theme.shadows.sm};
//   font-family: ${theme.typography.fontFamily.body};
// `;
//
// ---------------------------------------------------------------------------
// Usage with Emotion
// ---------------------------------------------------------------------------
//
// /** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';
// import { theme } from './theme';
//
// const buttonStyle = css`
//   background: ${theme.colors.brand.primary};
//   color: ${theme.colors.text.primary};
//   padding: ${theme.spacing['2']} ${theme.spacing['4']};
//   border-radius: ${theme.radii.md};
// `;
//
// function Button({ children }) {
//   return <button css={buttonStyle}>{children}</button>;
// }""")

    return "\n".join(lines)


def generate_framework_output(result: dict, palette_tokens: dict, framework: str) -> str:
    """Generate framework-specific component code.

    Dynamically selects which templates to emit based on the components
    recommended by the BM25 search results. Component slugs from the
    search are mapped to template keys via ``SLUG_TO_TEMPLATE``. Any
    template without a matching search result is still emitted so that
    the output always contains all 10 components.
    """
    lines = []
    palette = result["recommended_palette"]
    display_name = PALETTE_DISPLAY_NAMES.get(palette, palette)

    lines.append(f"// Universal Design System — {framework.title()} Components")
    lines.append(f"// Palette: {display_name}")
    lines.append(f"// Query: {result['query']}")
    lines.append("")

    if framework == "react":
        lines.append("// TIP: For production use, install the React package:")
        lines.append("//   npm install @mkatogui/uds-react")
        lines.append("//   import { Button, Card, Input } from '@mkatogui/uds-react';")
        lines.append("//   import '@mkatogui/uds-react/styles.css';")
        lines.append("")

    if framework == "web-components":
        lines.append("// Lit-based Custom Elements with Shadow DOM encapsulation")
        lines.append("// Install: npm install lit")
        lines.append("// Usage:   import './uds-button.js';")
        lines.append("//          <uds-button variant=\"primary\">Click me</uds-button>")
        lines.append("//")
        lines.append("// Custom Elements Manifest (customElements.json):")
        lines.append("// {")
        lines.append("//   \"schemaVersion\": \"1.0.0\",")
        lines.append("//   \"modules\": [")
        lines.append("//     {")
        lines.append("//       \"kind\": \"javascript-module\",")
        lines.append("//       \"path\": \"./uds-button.js\",")
        lines.append("//       \"declarations\": [{")
        lines.append("//         \"kind\": \"class\",")
        lines.append("//         \"name\": \"UdsButton\",")
        lines.append("//         \"tagName\": \"uds-button\",")
        lines.append("//         \"attributes\": [")
        lines.append("//           { \"name\": \"variant\", \"type\": { \"text\": \"'primary'|'secondary'|'ghost'|'destructive'\" } },")
        lines.append("//           { \"name\": \"size\", \"type\": { \"text\": \"'sm'|'md'|'lg'\" } },")
        lines.append("//           { \"name\": \"disabled\", \"type\": { \"text\": \"boolean\" } }")
        lines.append("//         ],")
        lines.append("//         \"slots\": [{ \"name\": \"\", \"description\": \"Button content\" }],")
        lines.append("//         \"cssProperties\": [")
        lines.append("//           { \"name\": \"--color-brand-primary\" },")
        lines.append("//           { \"name\": \"--color-text-on-brand\" },")
        lines.append("//           { \"name\": \"--radius-md\" }")
        lines.append("//         ]")
        lines.append("//       }]")
        lines.append("//     }")
        lines.append("//   ]")
        lines.append("// }")
        lines.append("")

    templates = FRAMEWORK_TEMPLATES.get(framework, FRAMEWORK_TEMPLATES.get("react", {}))

    # Build ordered list: matched search results first, then remaining templates.
    matched: list[str] = []
    comp_slugs = [
        c.get("slug", c.get("name", "")).lower()
        for c in result["search_results"]["components"]
    ]
    for slug in comp_slugs:
        tpl_key = SLUG_TO_TEMPLATE.get(slug)
        if tpl_key and tpl_key in templates and tpl_key not in matched:
            matched.append(tpl_key)

    # Append any templates not already matched so all 10 are emitted.
    all_template_keys = list(templates.keys())
    for key in all_template_keys:
        if key not in matched:
            matched.append(key)

    for tpl_key in matched:
        display = tpl_key.replace("-", " ").title()
        lines.append(f"// --- {display} Component ---")
        lines.append("")
        lines.append(templates[tpl_key])
        lines.append("")

    return "\n".join(lines)


def generate_markdown(result: dict, palette_tokens: dict) -> str:
    """Generate a Markdown design system specification."""
    lines = []
    domain = result["domain"]
    search = result["search_results"]
    palette = result["recommended_palette"]
    display_name = PALETTE_DISPLAY_NAMES.get(palette, palette)

    lines.append(f"# Design System: {result['query'].title()}")
    lines.append("")
    lines.append(f"**Palette:** {display_name} (`data-theme=\"{palette}\"`)")
    lines.append(f"**Sector:** {domain['sector']}")
    lines.append(f"**Product Type:** {domain['product_type']}")
    lines.append("")

    # Palette tokens
    if palette_tokens:
        lines.append("## Color Tokens")
        lines.append("")
        lines.append("```css")
        lines.append(f':root[data-theme="{palette}"] {{')
        for token, value in sorted(palette_tokens.items()):
            lines.append(f"  {token}: {value};")
        lines.append("}")
        lines.append("```")
        lines.append("")

    # Components
    if search["components"]:
        lines.append("## Components")
        lines.append("")
        lines.append("| Component | Category | Variants |")
        lines.append("|-----------|----------|----------|")
        for comp in search["components"]:
            name = comp.get("name", "?")
            cat = comp.get("category", "")
            variants = comp.get("variants", "")
            lines.append(f"| {name} | {cat} | {variants} |")
        lines.append("")

    # Patterns
    if search["patterns"]:
        lines.append("## Patterns")
        lines.append("")
        for pat in search["patterns"]:
            name = pat.get("name", "?")
            desc = pat.get("description", "")
            lines.append(f"### {name}")
            lines.append(f"{desc}")
            lines.append("")

    # Typography
    if search["typography"]:
        lines.append("## Typography")
        lines.append("")
        lines.append("| Heading Font | Body Font | Mood |")
        lines.append("|-------------|-----------|------|")
        for t in search["typography"][:3]:
            h = t.get("heading_font", "?")
            b = t.get("body_font", "?")
            m = t.get("mood", "")
            lines.append(f"| {h} | {b} | {m} |")
        lines.append("")

    # Anti-patterns
    if result["anti_patterns"]:
        lines.append("## Anti-Patterns (Avoid)")
        lines.append("")
        for ap in result["anti_patterns"]:
            sev = ap.get("severity", "").upper()
            name = ap.get("anti_pattern", "")
            desc = ap.get("description", "")
            alt = ap.get("alternative", "")
            lines.append(f"- **[{sev}] {name}**: {desc}")
            if alt:
                lines.append(f"  - *Instead:* {alt}")
        lines.append("")

    # Rules applied
    if result["rules_applied"]:
        lines.append("## Design Rules Applied")
        lines.append("")
        for rule in result["rules_applied"][:10]:
            reasoning = rule.get("reasoning", "")
            lines.append(f"- {reasoning}")
        lines.append("")

    # UX Guidelines
    if search["guidelines"]:
        lines.append("## UX Guidelines")
        lines.append("")
        for g in search["guidelines"][:5]:
            guideline = g.get("guideline", "")
            rationale = g.get("rationale", "")
            lines.append(f"- {guideline}")
            if rationale:
                lines.append(f"  - *Rationale:* {rationale}")
        lines.append("")

    # Quick start
    lines.append("## Quick Start")
    lines.append("")
    lines.append("```html")
    lines.append(f'<html lang="en" data-theme="{palette}">')
    lines.append("```")
    lines.append("")
    lines.append("Switch themes at runtime:")
    lines.append("```js")
    lines.append(f"document.documentElement.setAttribute('data-theme', '{palette}');")
    lines.append("```")

    return "\n".join(lines)


def generate_unstyled_markdown(result: dict) -> str:
    """Generate a headless/unstyled component specification in Markdown.

    Outputs behavior-only specs: ARIA attributes, keyboard interactions,
    state machines, and focus management — no CSS classes or visual tokens.
    """
    lines = []
    domain = result["domain"]

    lines.append(f"# Headless Component Spec: {result['query'].title()}")
    lines.append("")
    lines.append(f"**Mode:** Unstyled / Headless (behavior-only)")
    lines.append(f"**Sector:** {domain['sector']}")
    lines.append(f"**Product Type:** {domain['product_type']}")
    lines.append("")
    lines.append("> These specs define ARIA attributes, keyboard interactions, "
                 "state machines, and focus management only. No CSS classes or "
                 "visual tokens are included. Bring your own styles.")
    lines.append("")

    for name, spec in sorted(UNSTYLED_TEMPLATES.items()):
        display = name.replace("-", " ").title()
        lines.append(f"## {display}")
        lines.append("")
        lines.append(f"**Element:** `<{spec['element']}>`")
        lines.append("")

        # ARIA
        lines.append("**ARIA Attributes:**")
        lines.append("")
        for attr, val in spec["aria"].items():
            lines.append(f"- `{attr}`: `{val}`")
        lines.append("")

        # Keyboard
        lines.append("**Keyboard Interactions:**")
        lines.append("")
        for interaction in spec["keyboard"]:
            lines.append(f"- {interaction}")
        lines.append("")

        # States
        lines.append(f"**States:** {', '.join(spec['states'])}")
        lines.append("")

        # Focus
        lines.append(f"**Focus Management:** {spec['focus']}")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def generate_unstyled_json(result: dict) -> dict:
    """Generate a headless/unstyled component specification as a dict for JSON output.

    Returns a dict with query metadata and all UNSTYLED_TEMPLATES entries.
    """
    domain = result["domain"]
    return {
        "query": result["query"],
        "mode": "unstyled",
        "domain": domain,
        "components": {
            name: {
                "element": spec["element"],
                "aria": spec["aria"],
                "keyboard": spec["keyboard"],
                "states": spec["states"],
                "focus": spec["focus"],
            }
            for name, spec in sorted(UNSTYLED_TEMPLATES.items())
        },
    }


def main():
    parser = argparse.ArgumentParser(
        description="Generate a Design System Specification",
    )
    parser.add_argument("query", help="Design system query (e.g., 'fintech dashboard')")
    parser.add_argument("--format", "-f", choices=["markdown", "json", "tailwind", "css-in-js"], default="markdown", help="Output format")
    parser.add_argument("--framework", choices=["react", "vue", "svelte", "web-components", "html"], default=None, help="Generate framework-specific component code")
    parser.add_argument("--unstyled", action="store_true", default=False, help="Output headless/unstyled behavior-only specs (ARIA, keyboard, states, focus management) without CSS classes or visual tokens")
    args = parser.parse_args()

    engine = ReasoningEngine()
    result = engine.reason(args.query)

    # Unstyled / headless mode — skip token resolution entirely
    if args.unstyled:
        if args.format == "json":
            print(json.dumps(generate_unstyled_json(result), indent=2))
        else:
            print(generate_unstyled_markdown(result))
        return

    tokens = load_tokens()
    palette_tokens = resolve_palette_tokens(tokens, result["recommended_palette"])
    foundation = resolve_foundation_tokens(tokens)

    if args.format == "tailwind":
        print(generate_tailwind_config(palette_tokens, result["recommended_palette"], foundation))
    elif args.format == "css-in-js":
        print(generate_css_in_js(palette_tokens, result["recommended_palette"], foundation))
    elif args.framework:
        print(generate_framework_output(result, palette_tokens, args.framework))
    elif args.format == "json":
        # Determine palette source for explainability
        palette_source = "default"
        palette_rule_id = None
        for rule in result["rules_applied"]:
            if rule["then_field"] == "palette":
                palette_source = "rule"
                palette_rule_id = rule.get("rule_id")
                break
        if palette_source == "default" and result["search_results"]["products"]:
            top_product = result["search_results"]["products"][0]
            if top_product.get("palette") == result["recommended_palette"]:
                palette_source = "product_search"

        output = {
            "query": result["query"],
            "palette": result["recommended_palette"],
            "palette_display": PALETTE_DISPLAY_NAMES.get(result["recommended_palette"], result["recommended_palette"]),
            "palette_source": palette_source,
            "palette_rule_id": palette_rule_id,
            "domain": result["domain"],
            "tokens": palette_tokens,
            "components": [
                {"name": c.get("name"), "score": c.get("_score"), "source": c.get("_source")}
                for c in result["search_results"]["components"]
            ],
            "patterns": [
                {"name": p.get("name"), "score": p.get("_score"), "source": p.get("_source")}
                for p in result["search_results"]["patterns"]
            ],
            "products": [
                {"name": p.get("name"), "palette": p.get("palette"), "score": p.get("_score")}
                for p in result["search_results"]["products"]
            ],
            "typography": [
                {"heading": t.get("heading_font"), "body": t.get("body_font"), "score": t.get("_score")}
                for t in result["search_results"]["typography"]
            ],
            "anti_patterns": result["anti_patterns"],
            "rules": result["rules_applied"],
        }
        print(json.dumps(output, indent=2))
    else:
        print(generate_markdown(result, palette_tokens))


if __name__ == "__main__":
    main()
