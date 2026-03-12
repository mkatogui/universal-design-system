import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Components/Form Controls',
  tags: ['autodocs'],
};

export default meta;

export const Select: StoryObj = {
  render: () => `
    <div class="uds-select" style="max-width: 320px;">
      <label class="uds-select__label" for="demo-select">Category</label>
      <select id="demo-select" class="uds-select__field" aria-describedby="select-hint">
        <option value="">Choose an option...</option>
        <option value="design">Design</option>
        <option value="engineering">Engineering</option>
        <option value="marketing">Marketing</option>
      </select>
      <p id="select-hint" class="uds-select__hint">Select your department.</p>
    </div>
  `,
};

export const Checkbox: StoryObj = {
  render: () => `
    <fieldset class="uds-checkbox-group" role="group" aria-labelledby="checkbox-legend">
      <legend id="checkbox-legend" class="uds-checkbox-group__legend">Preferences</legend>
      <label class="uds-checkbox">
        <input type="checkbox" class="uds-checkbox__input" checked />
        <span class="uds-checkbox__label">Email notifications</span>
      </label>
      <label class="uds-checkbox">
        <input type="checkbox" class="uds-checkbox__input" />
        <span class="uds-checkbox__label">SMS notifications</span>
      </label>
      <label class="uds-checkbox">
        <input type="checkbox" class="uds-checkbox__input" disabled />
        <span class="uds-checkbox__label">Push notifications (coming soon)</span>
      </label>
    </fieldset>
  `,
};

export const Radio: StoryObj = {
  render: () => `
    <fieldset class="uds-radio-group" role="radiogroup" aria-labelledby="radio-legend">
      <legend id="radio-legend" class="uds-radio-group__legend">Plan</legend>
      <label class="uds-radio">
        <input type="radio" class="uds-radio__input" name="plan" value="free" checked />
        <span class="uds-radio__label">Free</span>
      </label>
      <label class="uds-radio">
        <input type="radio" class="uds-radio__input" name="plan" value="pro" />
        <span class="uds-radio__label">Pro</span>
      </label>
      <label class="uds-radio">
        <input type="radio" class="uds-radio__input" name="plan" value="enterprise" />
        <span class="uds-radio__label">Enterprise</span>
      </label>
    </fieldset>
  `,
};

export const DatePicker: StoryObj = {
  render: () => `
    <div class="uds-date-picker" style="max-width: 320px;">
      <label class="uds-date-picker__label" for="demo-date">Start date</label>
      <input id="demo-date" class="uds-date-picker__input" type="date" aria-describedby="date-hint" />
      <p id="date-hint" class="uds-date-picker__hint">Select a start date for your project.</p>
    </div>
  `,
};

export const FileUpload: StoryObj = {
  render: () => `
    <div class="uds-file-upload" style="max-width: 400px;">
      <label class="uds-file-upload__label" for="demo-file">Upload document</label>
      <div class="uds-file-upload__dropzone" role="button" tabindex="0" aria-describedby="file-hint">
        <p>Drag and drop a file here, or click to browse</p>
        <input id="demo-file" class="uds-file-upload__input" type="file" aria-describedby="file-hint" />
      </div>
      <p id="file-hint" class="uds-file-upload__hint">PDF, DOC, or DOCX up to 10MB.</p>
    </div>
  `,
};
