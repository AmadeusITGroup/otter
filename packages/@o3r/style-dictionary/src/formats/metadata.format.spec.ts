import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  metadataFormat,
} from './metadata.format.mjs';

jest.mock('style-dictionary/utils', () => ({
  createPropertyFormatter: jest.fn(),
  fileHeader: jest.fn(),
  getReferences: jest.fn(),
  sortByReference: jest.fn()
}));

describe('metadataFormat', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should have otter prefix', () => {
    expect(metadataFormat.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
});
