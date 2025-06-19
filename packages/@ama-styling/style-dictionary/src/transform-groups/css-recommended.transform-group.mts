import {
  transforms,
} from 'style-dictionary/enums';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  TransformGroup,
} from '../interfaces/style-dictionary.interface.mjs';

/** Transform group recommended by Otter */
export const cssRecommendedTransformGroup: TransformGroup = {
  name: `${OTTER_NAME_PREFIX}/css/recommended`,
  transforms: [
    transforms.attributeCti,
    transforms.nameKebab,
    transforms.timeSeconds,
    transforms.htmlIcon,
    transforms.sizeRem,
    transforms.colorCss,
    transforms.assetUrl,
    transforms.fontFamilyCss,
    transforms.cubicBezierCss,
    transforms.strokeStyleCssShorthand,
    transforms.borderCssShorthand,
    transforms.typographyCssShorthand,
    transforms.transitionCssShorthand,
    transforms.shadowCssShorthand,
    `${OTTER_NAME_PREFIX}/transform/ratio`,
    `${OTTER_NAME_PREFIX}/transform/unit`
  ]
};
