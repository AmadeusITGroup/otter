import type {
  TransformedToken,
} from 'style-dictionary/types';
import {
  type createPropertyFormatter,
} from 'style-dictionary/utils';

/** Type of a formatter function */
export type Formatter = ReturnType<typeof createPropertyFormatter>;

/** Type of a formatter function part of a formatter chain */
export type ChainFormatter = (token: TransformedToken, str?: string) => string;

/** Options supported by a formatter factory */
export type FormatterOptions = Parameters<typeof createPropertyFormatter>['0'] & { formatter?: Formatter };

/** Formatter factory type */
export type FormatterFactory = (options: FormatterOptions) => ChainFormatter;
