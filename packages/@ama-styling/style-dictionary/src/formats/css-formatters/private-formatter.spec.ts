import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  createPrivateFormatter,
} from './private-formatter.mjs';

const mocksPath = resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'dictionaries');

let mocks!: {
  singleToken: any;
  privateToken: any;
};

vi.mock('style-dictionary/utils', () => ({
  getReferences: vi.fn().mockImplementation((value, tokens) => {
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
  })
}));

describe('createPrivateFormatter', () => {
  beforeEach(() => vi.clearAllMocks());

  beforeAll(() => {
    mocks = {
      singleToken: JSON.parse(readFileSync(resolve(mocksPath, 'single-token.json'), { encoding: 'utf8' })),
      privateToken: JSON.parse(readFileSync(resolve(mocksPath, 'private-token.json'), { encoding: 'utf8' }))
    };
  });

  test('should format CSS variable', () => {
    const options: any = {
      dictionary: mocks.singleToken,
      formatter: vi.fn().mockImplementation((res) => res)
    };
    const css = createPrivateFormatter(options)(mocks.singleToken.tokens.color.primary['50'], '--color-primary-50: #ebf3ff;');
    expect(css).toBe('--color-primary-50: #ebf3ff;');
  });

  test('should format reference private CSS variable', () => {
    const options: any = {
      dictionary: mocks.privateToken,
      formatter: vi.fn().mockImplementation((res) => typeof res === 'object' ? res.value || res.$value : res),
      outputReferences: true,
      usesDtcg: true
    };
    const css = createPrivateFormatter(options)(mocks.privateToken.tokens.color.primary.ref, '--color-primary-ref: var(--color-primary-private-ref);');
    expect(css).toBe('--color-primary-ref: var(--color-primary-private-ref, #ebf3ff);');
  });
});
