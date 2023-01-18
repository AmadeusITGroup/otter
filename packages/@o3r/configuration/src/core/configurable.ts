import type { Configuration, ConfigurationMode } from '@o3r/core';
import { Observable } from 'rxjs';

/**
 * Dynamically Configurable item
 * NOTE: specify "legacy" as second parameter type to disable strict mode and allow values not supported by the CMS. This option is strongly not recommended and deprecated.
 */
// eslint-disable-next-line no-use-before-define
export interface DynamicConfigurable<T extends Configuration<U>, U extends ConfigurationMode = 'strict'> {
  /**
   * Configuration override
   */
  config: Partial<T> | undefined;

  /**
   * Configuration stream
   */
  config$: Observable<T>;
}

/**
 * Configurable item
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface Configurable<T extends {}> {
  /**
   * Configuration
   */
  config: T;
}
