import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  cssRecommendedTransformGroup,
} from './css-recommended-transform-group.mjs';

vi.mock('style-dictionary/enums', () => ({
  transforms: {
    attributeCti: vi.fn(),
    nameKebab: vi.fn(),
    timeSeconds: vi.fn(),
    htmlIcon: vi.fn(),
    sizeRem: vi.fn(),
    colorCss: vi.fn(),
    assetUrl: vi.fn(),
    fontFamilyCss: vi.fn(),
    cubicBezierCss: vi.fn(),
    strokeStyleCssShorthand: vi.fn(),
    borderCssShorthand: vi.fn(),
    typographyCssShorthand: vi.fn(),
    transitionCssShorthand: vi.fn(),
    shadowCssShorthand: vi.fn()
  }
}));

describe('cssRecommendedTransformGroup', () => {
  beforeEach(() => vi.clearAllMocks());

  test('should have otter prefix', () => {
    expect(cssRecommendedTransformGroup.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
});
