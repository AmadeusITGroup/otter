import type {
  Transform,
} from 'style-dictionary/types';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  DesignTokenExtensions,
} from '../interfaces/extensions-interface.mjs';

const numberPossiblePattern = /^[0-9.]*?\s*([a-z]+)$/;

const applyUnit = (value: string, unit: string) => {
  const match = value.match(numberPossiblePattern);
  if (!match) {
    if (!Number.isNaN(Number.parseFloat(value))) {
      return `${value}${unit}`;
    }
    return value;
  }
  const [, strUnit] = match;
  return value.replace(strUnit, unit);
};

const rec = (item: any, unit: string): any => {
  if (typeof item === 'object') {
    if (item === null) {
      return item;
    }
    if (Array.isArray(item)) {
      return item.map((value) => rec(value, unit));
    }
    return Object.fromEntries(
      Object.entries(item)
        .map(([name, value]) => ([name, rec(value, unit)]))
    );
  }
  return typeof item === 'string' ? applyUnit(item, unit) : item;
};

/**
 * Replace the unit of the values of the Token(s) it refer to, by the provided given `o3rUnit`
 */
export const unitTransform: Transform = {
  name: `${OTTER_NAME_PREFIX}/transform/unit`,
  type: 'value',
  filter: ({ attributes }) => {
    const hasUnit = attributes && (attributes as DesignTokenExtensions).o3rUnit !== undefined;
    return !!hasUnit;
  },
  transform: (token, _config, options) => {
    return rec(options.usesDtcg ? token.$value : token.value, (token.attributes as DesignTokenExtensions).o3rUnit!);
  }
};
