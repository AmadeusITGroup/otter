import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  cssRecommendedTransformGroup,
} from './css-recommended-transform-group.mjs';

jest.mock('style-dictionary/enums', () => ({
  transforms: {
    attributeCti: jest.fn(),
    nameKebab: jest.fn(),
    timeSeconds: jest.fn(),
    htmlIcon: jest.fn(),
    sizeRem: jest.fn(),
    colorCss: jest.fn(),
    assetUrl: jest.fn(),
    fontFamilyCss: jest.fn(),
    cubicBezierCss: jest.fn(),
    strokeStyleCssShorthand: jest.fn(),
    borderCssShorthand: jest.fn(),
    typographyCssShorthand: jest.fn(),
    transitionCssShorthand: jest.fn(),
    shadowCssShorthand: jest.fn()
  }
}));

describe('cssRecommendedTransformGroup', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should have otter prefix', () => {
    expect(cssRecommendedTransformGroup.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
});
