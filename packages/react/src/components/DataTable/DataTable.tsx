import React, { useState, useCallback } from 'react';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'basic' | 'sortable' | 'selectable' | 'expandable';
  density?: 'compact' | 'default' | 'comfortable';
  columns: DataTableColumn[];
  data: Record<string, unknown>[];
  sortable?: boolean;
  selectable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onSelectionChange?: (selectedRows: number[]) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ variant = 'basic', density = 'default', columns, data, sortable, selectable, onSort, onSelectionChange, emptyMessage = 'No data', loading, className, ...props }, ref) => {
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
      [sortKey, sortDir, onSort]
    );

    const handleSelectAll = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked ? new Set(data.map((_, i) => i)) : new Set<number>();
        setSelected(next);
        onSelectionChange?.(Array.from(next));
      },
      [data, onSelectionChange]
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
      [onSelectionChange]
    );

    const classes = [
      'uds-data-table',
      `uds-data-table--${variant}`,
      `uds-data-table--${density}`,
      loading && 'uds-data-table--loading',
      className,
    ].filter(Boolean).join(' ');

    const ariaSort = (key: string): 'ascending' | 'descending' | 'none' => {
      if (sortKey !== key) return 'none';
      return sortDir === 'asc' ? 'ascending' : 'descending';
    };

    return (
      <div ref={ref} className={classes} {...props}>
        <table className="uds-data-table__table" role="table">
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
                    <button className="uds-data-table__sort-btn" onClick={() => handleSort(col.key)} type="button">
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
                <td className="uds-data-table__empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={selected.has(rowIndex) ? 'uds-data-table__row--selected' : undefined}>
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
  }
);

DataTable.displayName = 'DataTable';
