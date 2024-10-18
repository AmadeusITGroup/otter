
/**
 * Determine if the given item is a promise
 * @param item Item to check
 */
export const isPromise = <T>(item: T | Promise<T>): item is Promise<T> => !!item && typeof (item as Promise<T>).then === 'function';

/**
 * Error raised when promise timeout
 */
export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message || 'Timeout of the promise');
  }
}

/**
 * Apply timeout to a given promise
 * @param promise Promise to timeout
 * @param timeout timeout of the given promise (in ms)
 */
export const withTimeout = async <T>(promise: Promise<T>, timeout?: number): Promise<T> => {
  if (!timeout) {
    return promise;
  }
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new TimeoutError()), timeout))]);
};
