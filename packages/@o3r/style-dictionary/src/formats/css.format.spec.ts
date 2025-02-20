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
  cssFormat,
} from './css.format.mjs';

const mocksPath = resolve(__dirname, '..', '..', 'testing', 'mocks', 'dictionaries');

let mocks!: {
  singleToken: any;
  privateToken: any;
  referenceToken: any;
};

jest.mock('style-dictionary/utils', () => ({
  createPropertyFormatter: jest.fn().mockImplementation(() => ({ name, $value, original }: any) =>
    original?.$value?.startsWith('{') ? `--${name}: var(--${original.$value.replace(/\{(.*)\}/, '$1').replaceAll('.', '-')})` : `--${name}: ${$value};`),
  fileHeader: jest.fn().mockReturnValue(''),
  getReferences: jest.fn().mockImplementation((value, tokens) => {
    const flat = (obj: any, mem: Set<any>) => {
      if (obj.isSource) {
        mem.add(obj);
      } else {
        Object.values(obj)
          .forEach((o) => flat(o, mem));
      }
      return mem;
    };
    return [...flat(tokens, new Set())].filter(({ path }: any) => value?.includes(path.join('.')));
  }),
  sortByReference: jest.fn()
}));

describe('cssFormat', () => {
  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    mocks = {
      singleToken: JSON.parse(readFileSync(resolve(mocksPath, 'single-token.json'), { encoding: 'utf8' })),
      privateToken: JSON.parse(readFileSync(resolve(mocksPath, 'private-token.json'), { encoding: 'utf8' })),
      referenceToken: JSON.parse(readFileSync(resolve(mocksPath, 'ref-token.json'), { encoding: 'utf8' }))
    };
  });

  test('should have otter prefix', () => {
    expect(cssFormat.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });

  test('should format single CSS variable', async () => {
    const css = await cssFormat.format({
      dictionary: mocks.singleToken,
      file: {},
      options: {},
      platform: {}
    }) as string;
    expect(css.replaceAll(/[\r\n]/g, '')).toBe(':root {--color-primary-50: #ebf3ff;}');
  });

  test('should format reference CSS variable', async () => {
    const css = await cssFormat.format({
      dictionary: mocks.referenceToken,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    expect(css.replaceAll(/[\r\n]/g, '')).toBe(':root {--color-primary-50: #ebf3ff;--color-primary-ref: var(--color-primary-50)}');
  });

  test('should format reference private CSS variable', async () => {
    const css = await cssFormat.format({
      dictionary: mocks.privateToken,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    expect(css.replaceAll(/[\r\n]/g, '')).toBe(':root {--color-primary-50: #ebf3ff;--color-primary-ref: var(--color-primary-private-ref, var(--color-primary-50))}');
  });
});
