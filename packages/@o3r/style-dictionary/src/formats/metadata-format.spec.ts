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
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  metadataFormat,
} from './metadata-format.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
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
    return [...flat(tokens, new Set())].filter(({ path }: any) => JSON.stringify(value)?.includes(path.join('.')));
  }),
  sortByReference: jest.fn()
}));

describe('metadataFormat', () => {
  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    mocks = {
      singleToken: JSON.parse(readFileSync(resolve(mocksPath, 'single-token.json'), { encoding: 'utf8' })),
      privateToken: JSON.parse(readFileSync(resolve(mocksPath, 'private-token.json'), { encoding: 'utf8' })),
      referenceToken: JSON.parse(readFileSync(resolve(mocksPath, 'ref-token.json'), { encoding: 'utf8' }))
    };
  });

  test('should have otter prefix', () => {
    expect(metadataFormat.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });

  test('should format single variable', async () => {
    const css = await metadataFormat.format({
      dictionary: mocks.singleToken,
      file: {},
      options: { usesDtcg: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);
    expect(obj).toMatchObject({
      variables: {
        'color-primary-50': {
          defaultValue: '#ebf3ff;',
          name: 'color-primary-50',
          references: [],
          type: 'color'
        }
      }
    });
  });

  test('should format reference variable', async () => {
    const css = await metadataFormat.format({
      dictionary: mocks.referenceToken,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);
    expect(obj).toMatchObject({
      variables: {
        'color-primary-50': {
          defaultValue: '#ebf3ff;',
          name: 'color-primary-50',
          references: [],
          type: 'color'
        },
        'color-primary-ref': {
          defaultValue: 'var(--color-primary-50)',
          name: 'color-primary-ref',
          references: [
            { defaultValue: '#ebf3ff;', name: 'color-primary-50', references: [] }
          ],
          type: 'color'
        }
      }
    });
  });

  test('should not format reference private variable', async () => {
    const css = await metadataFormat.format({
      dictionary: mocks.privateToken,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);
    expect(Object.keys(obj.variables)).not.toContain('color-primary-private-ref');
  });

  test('should format reference private variable when kept', async () => {
    const css = await metadataFormat.format({
      dictionary: mocks.privateToken,
      file: {},
      options: { outputReferences: true, usesDtcg: true, keepPrivate: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);
    expect(Object.keys(obj.variables)).toContain('color-primary-private-ref');
  });
});
