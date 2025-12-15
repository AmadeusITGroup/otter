import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  OTTER_EXTENSIONS_NODE_NAME,
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  extensionsJsonParser,
} from './extensions-json-parser.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const filePath = resolve(__dirname, '..', '..', 'testing', 'mocks', 'extensions.json');
let contents: string;

describe('extensionsJsonParser', () => {
  beforeEach(() => {
    contents = readFileSync(filePath, { encoding: 'utf8' });
  });
  test('should have otter prefix', () => {
    expect(extensionsJsonParser.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
  test('should contains only the extension field', async () => {
    const result = await extensionsJsonParser.parser({ contents, filePath });
    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys.includes('$schema')).toBe(false);
    expect(keys[0]).toBe(OTTER_EXTENSIONS_NODE_NAME);
  });
});
