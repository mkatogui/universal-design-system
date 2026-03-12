import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Components/Data Display',
  tags: ['autodocs'],
};

export default meta;

export const DataTable: StoryObj = {
  render: () => `
    <div class="uds-table" role="table" aria-label="User data">
      <div class="uds-table__header" role="rowgroup">
        <div class="uds-table__row" role="row">
          <div class="uds-table__th" role="columnheader" aria-sort="ascending">Name</div>
          <div class="uds-table__th" role="columnheader">Email</div>
          <div class="uds-table__th" role="columnheader">Status</div>
        </div>
      </div>
      <div class="uds-table__body" role="rowgroup">
        <div class="uds-table__row" role="row">
          <div class="uds-table__td" role="cell">Alice Johnson</div>
          <div class="uds-table__td" role="cell">alice@example.com</div>
          <div class="uds-table__td" role="cell"><span class="uds-badge uds-badge--success uds-badge--sm">Active</span></div>
        </div>
        <div class="uds-table__row" role="row">
          <div class="uds-table__td" role="cell">Bob Smith</div>
          <div class="uds-table__td" role="cell">bob@example.com</div>
          <div class="uds-table__td" role="cell"><span class="uds-badge uds-badge--warning uds-badge--sm">Pending</span></div>
        </div>
        <div class="uds-table__row" role="row">
          <div class="uds-table__td" role="cell">Carol Davis</div>
          <div class="uds-table__td" role="cell">carol@example.com</div>
          <div class="uds-table__td" role="cell"><span class="uds-badge uds-badge--error uds-badge--sm">Inactive</span></div>
        </div>
      </div>
    </div>
  `,
};

export const Tooltip: StoryObj = {
  render: () => `
    <div style="padding: 3rem;">
      <button class="uds-btn uds-btn--secondary uds-btn--md" aria-describedby="tooltip-1">Hover me</button>
      <div id="tooltip-1" class="uds-tooltip uds-tooltip--top" role="tooltip" style="display: inline-block; margin-left: 1rem;">
        This is a tooltip with helpful information.
      </div>
    </div>
  `,
};

export const Stat: StoryObj = {
  render: () => `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 600px;">
      <div class="uds-stat">
        <span class="uds-stat__value">12,345</span>
        <span class="uds-stat__label">Total Users</span>
        <span class="uds-stat__trend uds-stat__trend--up">+12.3%</span>
      </div>
      <div class="uds-stat">
        <span class="uds-stat__value">$48.2K</span>
        <span class="uds-stat__label">Revenue</span>
        <span class="uds-stat__trend uds-stat__trend--up">+8.1%</span>
      </div>
      <div class="uds-stat">
        <span class="uds-stat__value">23ms</span>
        <span class="uds-stat__label">Avg Response</span>
        <span class="uds-stat__trend uds-stat__trend--down">-5.2%</span>
      </div>
    </div>
  `,
};

export const Skeleton: StoryObj = {
  render: () => `
    <div style="max-width: 360px; display: flex; flex-direction: column; gap: 0.75rem;">
      <div class="uds-skeleton uds-skeleton--circle" style="width: 48px; height: 48px;"></div>
      <div class="uds-skeleton uds-skeleton--text" style="width: 80%; height: 1rem;"></div>
      <div class="uds-skeleton uds-skeleton--text" style="width: 60%; height: 1rem;"></div>
      <div class="uds-skeleton uds-skeleton--rect" style="width: 100%; height: 120px;"></div>
    </div>
  `,
};

export const Progress: StoryObj = {
  render: () => `
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
      <div class="uds-progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">
        <div class="uds-progress__bar" style="width: 25%;"></div>
      </div>
      <div class="uds-progress" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="Download progress">
        <div class="uds-progress__bar" style="width: 60%;"></div>
      </div>
      <div class="uds-progress" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" aria-label="Processing">
        <div class="uds-progress__bar" style="width: 90%;"></div>
      </div>
    </div>
  `,
};
