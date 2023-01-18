const getTestRule = require('jest-preset-stylelint/getTestRule');
const path = require('path');

global.stylelintTestRule = getTestRule({ plugins: [path.resolve(__dirname, '../dist/src/index.js')] });
