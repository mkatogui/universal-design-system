<script lang="ts">
  interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }

  interface Props {
    variant?: 'basic' | 'sortable' | 'selectable' | 'expandable';
    density?: 'compact' | 'default' | 'comfortable';
    columns?: Column[];
    data?: Record<string, any>[];
    sortable?: boolean;
    selectable?: boolean;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    selectedRows?: Set<number>;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onSelect?: (selected: Set<number>) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    variant = 'basic',
    density = 'default',
    columns = [],
    data = [],
    sortable = false,
    selectable = false,
    sortKey = '',
    sortDirection = 'asc',
    selectedRows = new Set<number>(),
    onSort,
    onSelect,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-data-table',
      `uds-data-table--${variant}`,
      `uds-data-table--${density}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  function handleSort(key: string) {
    const direction = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort?.(key, direction);
  }

  function handleSelectAll() {
    if (selectedRows.size === data.length) {
      onSelect?.(new Set());
    } else {
      onSelect?.(new Set(data.map((_, i) => i)));
    }
  }

  function handleSelectRow(index: number) {
    const next = new Set(selectedRows);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    onSelect?.(next);
  }
</script>

<div class={classes} {...rest}>
  <table class="uds-data-table__table" role="table">
    <thead class="uds-data-table__head">
      <tr>
        {#if selectable}
          <th class="uds-data-table__th uds-data-table__th--select" scope="col">
            <input
              type="checkbox"
              checked={selectedRows.size === data.length && data.length > 0}
              onchange={handleSelectAll}
              aria-label="Select all rows"
            />
          </th>
        {/if}
        {#each columns as column}
          <th
            class="uds-data-table__th"
            scope="col"
            aria-sort={sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
            style:width={column.width}
          >
            {#if (sortable || column.sortable) && variant !== 'basic'}
              <button class="uds-data-table__sort" onclick={() => handleSort(column.key)}>
                {column.label}
                <span class="uds-data-table__sort-icon" aria-hidden="true"></span>
              </button>
            {:else}
              {column.label}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="uds-data-table__body">
      {#if data.length === 0}
        <tr>
          <td class="uds-data-table__empty" colspan={columns.length + (selectable ? 1 : 0)}>
            No data available
          </td>
        </tr>
      {:else}
        {#each data as row, i}
          <tr class="uds-data-table__row" class:uds-data-table__row--selected={selectedRows.has(i)}>
            {#if selectable}
              <td class="uds-data-table__td uds-data-table__td--select">
                <input
                  type="checkbox"
                  checked={selectedRows.has(i)}
                  onchange={() => handleSelectRow(i)}
                  aria-label="Select row {i + 1}"
                />
              </td>
            {/if}
            {#each columns as column}
              <td class="uds-data-table__td">{row[column.key] ?? ''}</td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {@render children?.()}
</div>
