<script lang="ts">
  interface Props {
    variant?: 'numbered' | 'simple' | 'load-more' | 'infinite-scroll';
    size?: 'sm' | 'md';
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'numbered',
    size = 'md',
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    class: className = '',
    ...rest
  }: Props = $props();

  let classes = $derived(
    [
      'uds-pagination',
      `uds-pagination--${variant}`,
      `uds-pagination--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let pages = $derived(() => {
    const p: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        p.push(i);
      } else if (p[p.length - 1] !== '...') {
        p.push('...');
      }
    }
    return p;
  });

  function goTo(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  }
</script>

<nav class={classes} aria-label="Pagination" {...rest}>
  {#if variant === 'simple'}
    <button
      class="uds-pagination__prev"
      disabled={currentPage <= 1}
      onclick={() => goTo(currentPage - 1)}
      aria-label="Previous page"
    >
      Previous
    </button>
    <span class="uds-pagination__info">Page {currentPage} of {totalPages}</span>
    <button
      class="uds-pagination__next"
      disabled={currentPage >= totalPages}
      onclick={() => goTo(currentPage + 1)}
      aria-label="Next page"
    >
      Next
    </button>
  {:else if variant === 'load-more'}
    <button
      class="uds-pagination__load-more"
      disabled={currentPage >= totalPages}
      onclick={() => goTo(currentPage + 1)}
    >
      Load more
    </button>
  {:else}
    <button
      class="uds-pagination__prev"
      disabled={currentPage <= 1}
      onclick={() => goTo(currentPage - 1)}
      aria-label="Previous page"
    >
      &laquo;
    </button>
    <ol class="uds-pagination__list">
      {#each pages() as page}
        {#if typeof page === 'number'}
          <li>
            <button
              class="uds-pagination__page"
              class:uds-pagination__page--active={page === currentPage}
              aria-current={page === currentPage ? 'page' : undefined}
              onclick={() => goTo(page)}
            >
              {page}
            </button>
          </li>
        {:else}
          <li class="uds-pagination__ellipsis" aria-hidden="true">&hellip;</li>
        {/if}
      {/each}
    </ol>
    <button
      class="uds-pagination__next"
      disabled={currentPage >= totalPages}
      onclick={() => goTo(currentPage + 1)}
      aria-label="Next page"
    >
      &raquo;
    </button>
  {/if}
</nav>
