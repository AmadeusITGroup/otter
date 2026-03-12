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
  createGradientFormatter,
} from './gradients-formatter.mjs';

const mocksPath = resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'dictionaries');

let mocks!: {
  gradientToken: any;
  gradientTokenRef: any;
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

describe('createGradientFormatter', () => {
  beforeEach(() => vi.clearAllMocks());

  beforeAll(() => {
    mocks = {
      gradientToken: JSON.parse(readFileSync(resolve(mocksPath, 'gradient-token.json'), { encoding: 'utf8' })),
      gradientTokenRef: JSON.parse(readFileSync(resolve(mocksPath, 'gradient-token-ref.json'), { encoding: 'utf8' }))
    };
  });

  test('should format CSS variable', () => {
    const options: any = {
      dictionary: mocks.gradientToken,
      formatter: vi.fn().mockImplementation((res) => res),
      outputReferences: true,
      usesDtcg: true
    };
    const css = createGradientFormatter(options)(mocks.gradientToken.tokens.gradient.primary['50'], '--gradient-primary-50: [object Object];');
    expect(css).toBe('--gradient-primary-50: linear-gradient(90deg, #000 0%, #fff 100%);');
  });

  test('should format reference CSS variable', () => {
    const options: any = {
      dictionary: mocks.gradientTokenRef,
      formatter: vi.fn().mockImplementation((res) => typeof res === 'object' ? res.value || res.$value : res),
      outputReferences: true,
      usesDtcg: true
    };
    const css = createGradientFormatter(options)(mocks.gradientTokenRef.tokens.gradient.primary['50'], '--gradient-primary-50: [object Object];');
    expect(css).toBe('--gradient-primary-50: linear-gradient(90deg, var(--color-primary-50) 0%, #fff 100%);');
  });
});
