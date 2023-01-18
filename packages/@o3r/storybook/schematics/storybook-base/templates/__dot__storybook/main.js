const path = require('path');

module.exports = {
  'stories': [
    // TODO: change to be more restrictive according to the project
    '../**/src/**/*.stories.ts'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-scss',
    '@o3r/storybook'
  ],
  core: {
    'builder': 'webpack5'
  }
};
