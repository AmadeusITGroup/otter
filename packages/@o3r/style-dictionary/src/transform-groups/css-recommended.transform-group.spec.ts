import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  cssRecommendedTransformGroup,
} from './css-recommended.transform-group.mjs';

describe('cssRecommendedTransformGroup', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should have otter prefix', () => {
    expect(cssRecommendedTransformGroup.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });
});
