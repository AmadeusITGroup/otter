import {
  arrayBasedOperators,
} from './array-based.operators';
import {
  basicOperators,
} from './basic.operators';
import {
  dateBasedOperators,
} from './date-based.operators';
import {
  numberBasedOperators,
} from './number-based.operators';

export * from './array-based.operators';
export * from './basic.operators';
export * from './date-based.operators';
export * from './number-based.operators';

export const operatorList = [...arrayBasedOperators, ...basicOperators, ...numberBasedOperators, ...dateBasedOperators];
