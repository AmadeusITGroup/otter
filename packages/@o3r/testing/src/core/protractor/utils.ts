import {promise as pPromise} from 'protractor';

/**
 * Converts a webdriver promise to ES6 promise so the rest of the framework handles ES6 promises only
 * @param promise
 */
export function convertPromise<T>(promise: pPromise.Promise<T>) {
  return new Promise<T>((resolve, reject) => promise.then(resolve, reject));
}
