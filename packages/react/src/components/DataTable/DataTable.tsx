import React, { useCallback, useState } from 'react';

/**
 * Describes a single column in a {@link DataTable}.
 */
export interface DataTableColumn {
  /** Key used to look up the value from each data row object. */
  key: string;
  /** Visible header text. */
  header: string;
  /** Allow sorting by this column. */
  sortable?: boolean;
  /** Custom render function for cell content. */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

/**
 * Props for the {@link DataTable} component.
 *
 * Extends native `<div>` attributes.
 */
export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Feature variant. @default 'basic' */
  variant?: 'basic' | 'sortable' | 'selectable' | 'expandable';
  /** Row density. @default 'default' */
  density?: 'compact' | 'default' | 'comfortable';
  /** Column definitions. */
  columns: DataTableColumn[];
  /** Array of row objects keyed by column `key`. */
  data: Record<string, unknown>[];
  /** Enable column sorting controls. */
  sortable?: boolean;
  /** Enable row selection checkboxes. */
  selectable?: boolean;
  /** Called when a sortable column header is clicked. */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Called when the set of selected rows changes. */
  onSelectionChange?: (selectedRows: number[]) => void;
  /** Message shown when `data` is empty. @default 'No data' */
  emptyMessage?: string;
  /** Show a loading state. */
  loading?: boolean;
}

/**
 * A data table with optional column sorting, row selection, and custom
 * cell renderers.
 *
 * Renders a semantic `<table>` with `role="table"`, `scope="col"` headers,
 * and `aria-sort` attributes on sortable columns.
 *
 * Uses BEM class `uds-data-table` with variant and density modifiers.
 * Forwards its ref to the root wrapper `<div>`.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[{ key: 'name', header: 'Name', sortable: true }]}
 *   data={[{ name: 'Alice' }, { name: 'Bob' }]}
 *   sortable
 * />
 * ```
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  (
    {
      variant = 'basic',
      density = 'default',
      columns,
      data,
      sortable,
      selectable,
      onSort,
      onSelectionChange,
      emptyMessage = 'No data',
      loading,
      className,
      ...props
    },
    ref,
  ) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const handleSort = useCallback(
      (key: string) => {
        const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortDir(dir);
        onSort?.(key, dir);
      },
      [sortKey, sortDir, onSort],
    );

    const handleSelectAll = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked ? new Set(data.map((_, i) => i)) : new Set<number>();
        setSelected(next);
        onSelectionChange?.(Array.from(next));
      },
      [data, onSelectionChange],
    );

    const handleSelectRow = useCallback(
      (index: number) => {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(index)) next.delete(index);
          else next.add(index);
          onSelectionChange?.(Array.from(next));
          return next;
        });
      },
      [onSelectionChange],
    );

    const classes = [
      'uds-data-table',
      `uds-data-table--${variant}`,
      `uds-data-table--${density}`,
      loading && 'uds-data-table--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const ariaSort = (key: string): 'ascending' | 'descending' | 'none' => {
      if (sortKey !== key) return 'none';
      return sortDir === 'asc' ? 'ascending' : 'descending';
    };

    return (
      <div ref={ref} className={classes} {...props}>
        <table className="uds-data-table__table">
          <thead>
            <tr>
              {selectable && (
                <th className="uds-data-table__th uds-data-table__th--checkbox" scope="col">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="uds-data-table__th"
                  scope="col"
                  aria-sort={sortable && col.sortable ? ariaSort(col.key) : undefined}
                >
                  {sortable && col.sortable ? (
                    <button
                      className="uds-data-table__sort-btn"
                      onClick={() => handleSort(col.key)}
                      type="button"
                    >
                      {col.header}
                      <span className="uds-data-table__sort-icon" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  className="uds-data-table__empty"
                  colSpan={columns.length + (selectable ? 1 : 0)}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={selected.has(rowIndex) ? 'uds-data-table__row--selected' : undefined}
                >
                  {selectable && (
                    <td className="uds-data-table__td uds-data-table__td--checkbox">
                      <input
                        type="checkbox"
                        checked={selected.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="uds-data-table__td">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  },
);

DataTable.displayName = 'DataTable';
