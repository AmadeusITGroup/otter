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
    'attribute/cti',
    'name/kebab',
    'time/seconds',
    'html/icon',
    'size/rem',
    'color/css',
    'asset/url',
    'fontFamily/css',
    'cubicBezier/css',
    'strokeStyle/css/shorthand',
    'border/css/shorthand',
    'typography/css/shorthand',
    'transition/css/shorthand',
    'shadow/css/shorthand',
    `${OTTER_NAME_PREFIX}/transform/ratio`,
    `${OTTER_NAME_PREFIX}/transform/unit`
  ]
};
