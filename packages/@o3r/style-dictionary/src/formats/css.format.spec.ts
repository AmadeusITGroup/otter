import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  cssFormat,
} from './css.format.mjs';

jest.mock('style-dictionary/utils', () => ({
  createPropertyFormatter: jest.fn(),
  fileHeader: jest.fn(),
  getReferences: jest.fn(),
  sortByReference: jest.fn()
}));

describe('cssFormat', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should have otter prefix', () => {
    expect(cssFormat.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
});
