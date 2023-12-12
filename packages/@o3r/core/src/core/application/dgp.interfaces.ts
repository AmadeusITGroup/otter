export interface BootstrapConfig {

  /**
   * App environment
   *
   */
  environment: 'prod' | 'dev';

}

/** Data set injected to the page from the DGP web-server */
export interface Dataset {
  /**
   * Bootstrap configuration
   * @example
   * '{ environment: 'prod' }'
   */
  bootstrapconfig?: string;

  /**
   * Dynamic content path
   * @example
   * 'my/dynamic/path'
   */
  dynamiccontentpath?: string;

  /**
   * Application basehref url
   * @example
   * '/my/base/href'
   */
  appbasehref?: string;

}
