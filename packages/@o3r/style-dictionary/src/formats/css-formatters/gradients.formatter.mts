import {
  getReferences,
} from 'style-dictionary/utils';
import type {
  FormatterFactory,
} from './interface.formatter.mjs';

type DesignTokenTypeGradientStop = {
  /** Color to the stop of a gradient */
  color: string;
  /** Position of the stop */
  position: string | number;
};

type DesignTokenTypeGradientValue = {
  /** Type of the gradient */
  type?: 'linear' | 'radial' | 'conic';
  /** Angle to the gradient */
  angle?: string | number;
  /** List of stops in the gradient */
  stops?: DesignTokenTypeGradientStop[];
};

// eslint-disable-next-line @typescript-eslint/no-base-to-string -- get the value of serialized object
const objectString = new Object().toString();

/**
 * Retrieve a formatter for a Token with Gradient type
 * @param options Option of gradient formatter generator
 */
export const createGradientFormatter: FormatterFactory = (options) => {
  const tokens = options.dictionary.tokens;
  const prefix = options.formatting?.prefix ?? '--';

  return (token, str): string => {
    const type = options.usesDtcg ? token.$type : token.type;

    if (!str || !str.includes(objectString) || type !== 'gradient') {
      return str || '';
    }

    const value: DesignTokenTypeGradientValue = options.usesDtcg ? token.original.$value : token.original.value;
    const angle = typeof value.angle === 'number' ? value.angle + 'deg' : value.angle;
    let gradientValue = `${value.type || 'linear'}-gradient(${angle || '0deg'}, ${value.stops
      ?.map(({ color, position }) => `${color} ${typeof position === 'number' ? position * 100 + '%' : position}`)
      .join(', ')})`;

    if (options.outputReferences && options.formatter) {
      const refs = getReferences(value, options.dictionary.unfilteredTokens || tokens, options);
      if (refs.length > 0) {
        gradientValue = refs.reduce((acc, ref) => {
          return acc.replaceAll(`{${ref.path.join('.')}}`, `var(${prefix}${ref.name})`);
        }, gradientValue);
      }
    }

    return str.replace(objectString, gradientValue);
  };
};
