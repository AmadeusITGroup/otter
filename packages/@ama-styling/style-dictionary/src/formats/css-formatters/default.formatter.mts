import {
  createPropertyFormatter,
} from 'style-dictionary/utils';
import {
  createGradientFormatter,
} from './gradients.formatter.mjs';
import type {
  ChainFormatter,
  Formatter,
  FormatterFactory,
  FormatterOptions,
} from './interface.formatter.mjs';
import {
  createPrivateFormatter,
} from './private.formatter.mjs';

/**
 * Get default CSS Formatter
 * @param options Options
 */
export const getDefaultCssFormatter: FormatterFactory = (options) => {
  const formatters: ChainFormatter[] = [];
  const propertyFormatter: Formatter = (token) =>
    formatters.reduce((acc: undefined | string, formatter) => formatter(token, acc), undefined)!;

  const formatterOptions: FormatterOptions = {
    ...options,
    formatter: propertyFormatter
  };

  // formatter list to chain
  formatters.push(
    createPropertyFormatter(formatterOptions),
    createGradientFormatter(formatterOptions),
    createPrivateFormatter(formatterOptions)
  );

  return propertyFormatter;
};
