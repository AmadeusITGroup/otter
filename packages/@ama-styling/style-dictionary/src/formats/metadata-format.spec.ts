import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  getReferences,
} from 'style-dictionary/utils';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  metadataFormat,
} from './metadata-format.mjs';

const mocksPath = resolve(__dirname, '..', '..', 'testing', 'mocks', 'dictionaries');

let mocks!: {
  singleToken: any;
  privateToken: any;
  privateRefs: any;
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

const getMockReferences = jest.mocked(getReferences);

describe('metadataFormat', () => {
  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    mocks = {
      singleToken: JSON.parse(readFileSync(resolve(mocksPath, 'single-token.json'), { encoding: 'utf8' })),
      privateToken: JSON.parse(readFileSync(resolve(mocksPath, 'private-token.json'), { encoding: 'utf8' })),
      privateRefs: JSON.parse(readFileSync(resolve(mocksPath, 'private-refs.json'), { encoding: 'utf8' })),
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
          defaultValue: '#ebf3ff',
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
          defaultValue: '#ebf3ff',
          name: 'color-primary-50',
          references: [],
          type: 'color'
        },
        'color-primary-ref': {
          defaultValue: 'var(--color-primary-50)',
          name: 'color-primary-ref',
          references: [
            { defaultValue: '#ebf3ff', name: 'color-primary-50', references: [] }
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

  test('should correctly handle private variables with references', async () => {
    const css = await metadataFormat.format({
      dictionary: mocks.privateRefs,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);
    expect(obj).toMatchObject({
      variables: {
        'color-neutral-70': {
          name: 'color-neutral-70',
          type: 'color',
          defaultValue: '#4d4d4d',
          references: []
        },
        'badge-color-foreground-disabled': {
          name: 'badge-color-foreground-disabled',
          type: 'string',
          defaultValue: 'var(--application-color-foreground-generic-disabled, var(--color-neutral-70))',
          references: [
            {
              defaultValue: 'var(--color-neutral-70)',
              name: 'application-color-foreground-generic-disabled',
              references: [
                {
                  defaultValue: '#4d4d4d',
                  name: 'color-neutral-70',
                  references: []
                }
              ]
            }
          ]
        }
      }
    });
  });

  test('should unwrap parent structural nodes returned by getReferences for token paths ending in .value', async () => {
    // In DTCG mode, token paths like `{input.color.foreground.value}` have `.value` treated as
    // a literal path segment, not a token-value accessor (which would be `.$value`).
    // When the token hierarchy has a structural parent like:
    //   foreground: { value: { token }, label: { token } }
    // getReferences returns the parent object instead of the leaf token.
    // This test verifies the formatter unwraps such parent objects when:
    // - outer object lacks a `name` property (not a token)
    // - inner `value` object has a `name` property (is a token)
    const referencedToken = {
      $type: 'color',
      $value: '#545352',
      attributes: {
        category: 'input'
      },
      isSource: true,
      name: 'input-color-foreground-value',
      original: {
        $value: '#545352'
      },
      path: ['input', 'color', 'foreground', 'value']
    };

    const labelToken = {
      $type: 'color',
      $value: '#545352',
      attributes: {
        category: 'input'
      },
      isSource: true,
      name: 'input-color-foreground-label',
      original: {
        $value: '{input.color.foreground.value}'
      },
      path: ['input', 'color', 'foreground', 'label']
    };

    const wrappedReferenceDictionary = {
      allTokens: [referencedToken, labelToken],
      tokens: {
        input: {
          color: {
            foreground: {
              value: referencedToken,
              label: labelToken
            }
          }
        }
      },
      unfilteredTokens: {}
    };
    const wrappedRef = wrappedReferenceDictionary.tokens.input.color.foreground.value;
    const defaultGetReferences = getMockReferences.getMockImplementation();

    getMockReferences.mockImplementation((value, tokens) => {
      if (value === '{input.color.foreground.value}') {
        return [{ value: wrappedRef } as any];
      }

      return defaultGetReferences ? defaultGetReferences(value, tokens) : [];
    });

    const css = await metadataFormat.format({
      dictionary: wrappedReferenceDictionary as any,
      file: {},
      options: { outputReferences: true, usesDtcg: true },
      platform: {}
    }) as string;
    const obj = JSON.parse(css);

    expect(obj).toMatchObject({
      variables: {
        'input-color-foreground-label': {
          name: 'input-color-foreground-label',
          defaultValue: 'var(--input-color-foreground-value)',
          references: [
            {
              name: 'input-color-foreground-value',
              defaultValue: '#545352',
              references: []
            }
          ]
        }
      }
    });

    expect(getMockReferences).toHaveBeenCalledWith('{input.color.foreground.value}', wrappedReferenceDictionary.tokens);
  });
});
