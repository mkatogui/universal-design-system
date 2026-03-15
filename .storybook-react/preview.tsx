import React from 'react';
import type { Preview } from '@storybook/react';
import '../packages/react/src/styles/tokens.css';
import '../packages/react/src/styles/components.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
  },
  globalTypes: {},
};

export default preview;
