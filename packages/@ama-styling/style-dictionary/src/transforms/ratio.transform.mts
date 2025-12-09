import type {
  Transform,
} from 'style-dictionary/types';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  DesignTokenExtensions,
} from '../interfaces/extensions.interface.mjs';

const numberPossiblePattern = /^(.*?)\s*[a-z]*$/;

const applyRatio = (value: any, ratio: number) => {
  if (typeof value === 'number') {
    return value * ratio;
  } else if (typeof value === 'string') {
    const match = value.match(numberPossiblePattern);
    if (!match) {
      return value;
    }
    const [, strNumber] = match;
    const parsedNumber = Number.parseFloat(strNumber);
    if (Number.isNaN(parsedNumber)) {
      return value;
    }
    return value.replace(strNumber, Number.parseFloat((parsedNumber * ratio).toFixed(3)).toString());
  }
  return value;
};

const rec = (item: any, ratio: number): any => {
  if (typeof item === 'object') {
    if (item === null) {
      return item;
    }
    if (Array.isArray(item)) {
      return item.map((value) => rec(value, ratio));
    }
    return Object.fromEntries(
      Object.entries(item)
        .map(([name, value]) => ([name, rec(value, ratio)]))
    );
  }
  return applyRatio(item, ratio);
};

/**
 * Apply the given `o3rRatio` to the numeric values of the Token(s) it refer to.
 */
export const ratioTransform: Transform = {
  name: `${OTTER_NAME_PREFIX}/transform/ratio`,
  type: 'value',
  filter: ({ attributes }) => {
    const hasRatio = attributes && (attributes as DesignTokenExtensions).o3rRatio !== undefined;
    return !!hasRatio;
  },
  transform: (token, _config, options) => {
    return rec(options.usesDtcg ? token.$value : token.value, (token.attributes as DesignTokenExtensions).o3rRatio!);
  }
};
