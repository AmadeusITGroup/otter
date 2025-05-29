import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  oneLineTokenJsonParser,
} from './one-line-token.json.parser.mjs';

const filePath = resolve(__dirname, '..', '..', 'testing', 'mocks', 'design-token-theme.json');
let contents: string;

jest.mock('../helpers/config-deflatten.helpers.mjs', () => ({
  deflatten: jest.fn().mockImplementation((obj) => obj)
}));

describe('oneLineTokenJsonParser', () => {
  beforeEach(() => {
    contents = readFileSync(filePath, { encoding: 'utf8' });
    jest.clearAllMocks();
  });
  test('should have otter prefix', () => {
    expect(oneLineTokenJsonParser.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
  test('should deflatten given specification', async () => {
    const result = await oneLineTokenJsonParser.parser({ contents, filePath });
    const { deflatten } = await import('../helpers/config-deflatten.helpers.mjs');
    const contentObject = JSON.parse(contents);
    delete contentObject.$schema;
    expect(deflatten).toHaveBeenCalledWith(expect.objectContaining(contentObject));
    expect(result.$schema).toBeUndefined();
    expect(typeof result).toBe('object');
  });
});
