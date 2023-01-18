import {CanStartConditionFunction, WaitForFetch} from '../wait-for';

/**
 * Options of the ImpervaFetch plugin
 */
export interface ImpervaFetchOptions {
  /**
   * Amount of milliseconds to wait between two tries. Default: 250
   */
  delayBetweenTriesInMilliseconds: number;

  /**
   * Maximum number of tries before giving up. Default: 4
   */
  maximumTries: number;

  /**
   * If the cookie wasn't found after all the tries, should the call go through. Default: true
   */
  allowCallOnTimeout: boolean;

  /**
   * The name of the cookie to check the presence of. Default: reese84
   */
  cookieName: string;
}

/** Options default values */
const defaultOptions: ImpervaFetchOptions = {
  allowCallOnTimeout: true,
  delayBetweenTriesInMilliseconds: 250,
  maximumTries: 4,
  cookieName: 'reese84'
};

/**
 * Creates a CanStartConditionFunction with respect to the given ImpervaFetchOptions
 *
 * @param options
 */
const startConditionFactory: (options: ImpervaFetchOptions) => CanStartConditionFunction = (options) => {
  const cookieRegExp = new RegExp(`\\b${options.cookieName}=`);

  return async () => {
    for (let i = options.maximumTries - 1; i >= 0; i--) {
      if (cookieRegExp.test(document.cookie)) {
        return { result: true };
      }
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.delayBetweenTriesInMilliseconds));
      }
    }
    return { result: options.allowCallOnTimeout };
  };
};

/**
 * Plugin that waits for a specific cookie to be present in the document before sending any call.
 * Designed specifically for Imperva implementations, can also be used with any cookie as long as they can be accessed
 * from javascript (not HostOnly)
 *
 * @deprecated use the BotProtectionFingerprintRequest plug-in instead, will be removed in v10
 */
export class ImpervaFetch extends WaitForFetch {

  constructor(customOptions: Partial<ImpervaFetchOptions>) {
    const options = {...defaultOptions, ...customOptions};

    super(startConditionFactory(options));
  }
}
