import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../../packages/react/src/components/DataTable/DataTable';

const defaultColumns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
  { key: 'age', header: 'Age', sortable: true },
];

const defaultData = [
  { name: 'Alice', role: 'Admin', age: 30 },
  { name: 'Bob', role: 'Editor', age: 25 },
  { name: 'Carol', role: 'Viewer', age: 35 },
];

describe('DataTable', () => {
  it('renders with default BEM classes', () => {
    const { container } = render(<DataTable columns={defaultColumns} data={defaultData} />);
    const root = container.querySelector('.uds-data-table');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('uds-data-table--basic');
    expect(root).toHaveClass('uds-data-table--default');
  });

  it('applies variant modifier classes', () => {
    const { container: c1 } = render(
      <DataTable columns={defaultColumns} data={defaultData} variant="sortable" />,
    );
    expect(c1.querySelector('.uds-data-table')).toHaveClass('uds-data-table--sortable');

    const { container: c2 } = render(
      <DataTable columns={defaultColumns} data={defaultData} variant="selectable" />,
    );
    expect(c2.querySelector('.uds-data-table')).toHaveClass('uds-data-table--selectable');
  });

  it('applies density modifier classes', () => {
    const { container: c1 } = render(
      <DataTable columns={defaultColumns} data={defaultData} density="compact" />,
    );
    expect(c1.querySelector('.uds-data-table')).toHaveClass('uds-data-table--compact');

    const { container: c2 } = render(
      <DataTable columns={defaultColumns} data={defaultData} density="comfortable" />,
    );
    expect(c2.querySelector('.uds-data-table')).toHaveClass('uds-data-table--comfortable');
  });

  it('applies loading modifier class when loading is true', () => {
    const { container } = render(<DataTable columns={defaultColumns} data={defaultData} loading />);
    expect(container.querySelector('.uds-data-table')).toHaveClass('uds-data-table--loading');
  });

  it('renders column headers with scope="col"', () => {
    render(<DataTable columns={defaultColumns} data={defaultData} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Role');
    expect(headers[2]).toHaveTextContent('Age');
    for (const th of headers) {
      expect(th).toHaveAttribute('scope', 'col');
    }
  });

  it('renders all data rows', () => {
    render(<DataTable columns={defaultColumns} data={defaultData} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(<DataTable columns={defaultColumns} data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows custom emptyMessage when data is empty', () => {
    render(<DataTable columns={defaultColumns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders sort buttons when sortable is true and column.sortable is true', () => {
    render(<DataTable columns={defaultColumns} data={defaultData} sortable />);
    const sortButtons = screen.getAllByRole('button');
    // Only 'Name' and 'Age' columns are sortable
    expect(sortButtons).toHaveLength(2);
    expect(sortButtons[0]).toHaveTextContent('Name');
    expect(sortButtons[1]).toHaveTextContent('Age');
  });

  it('calls onSort with correct key and direction when sort button is clicked', () => {
    const onSort = vi.fn();
    render(<DataTable columns={defaultColumns} data={defaultData} sortable onSort={onSort} />);
    const sortButtons = screen.getAllByRole('button');

    fireEvent.click(sortButtons[0]);
    expect(onSort).toHaveBeenCalledWith('name', 'asc');

    // Clicking same column again should toggle to desc
    fireEvent.click(sortButtons[0]);
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('sets aria-sort on sortable columns correctly', () => {
    render(<DataTable columns={defaultColumns} data={defaultData} sortable />);
    const headers = screen.getAllByRole('columnheader');
    // Name and Age headers should have aria-sort="none" initially
    expect(headers[0]).toHaveAttribute('aria-sort', 'none');
    expect(headers[2]).toHaveAttribute('aria-sort', 'none');
    // Role header (not sortable) should not have aria-sort
    expect(headers[1]).not.toHaveAttribute('aria-sort');

    const sortButtons = screen.getAllByRole('button');
    fireEvent.click(sortButtons[0]);
    expect(headers[0]).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(sortButtons[0]);
    expect(headers[0]).toHaveAttribute('aria-sort', 'descending');
  });

  it('renders selection checkboxes and "Select all" when selectable is true', () => {
    render(<DataTable columns={defaultColumns} data={defaultData} selectable />);
    const checkboxes = screen.getAllByRole('checkbox');
    // 1 select-all + 3 row checkboxes
    expect(checkboxes).toHaveLength(4);
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
  });

  it('calls onSelectionChange when a row checkbox is toggled', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={defaultColumns}
        data={defaultData}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );
    const rowCheckbox = screen.getByLabelText('Select row 1');
    fireEvent.click(rowCheckbox);
    expect(onSelectionChange).toHaveBeenCalledWith([0]);
  });

  it('uses a custom render function for cell content', () => {
    const columns = [
      {
        key: 'name',
        header: 'Name',
        render: (value: unknown) => <strong data-testid="custom-cell">{String(value)}</strong>,
      },
    ];
    render(<DataTable columns={columns} data={[{ name: 'Alice' }]} />);
    expect(screen.getByTestId('custom-cell')).toHaveTextContent('Alice');
  });

  it('forwards a ref object to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DataTable ref={ref} columns={defaultColumns} data={defaultData} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-data-table');
  });

  it('forwards a callback ref to the root div', () => {
    const callbackRef = vi.fn();
    render(<DataTable ref={callbackRef} columns={defaultColumns} data={defaultData} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
