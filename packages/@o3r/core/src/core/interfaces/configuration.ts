import type { Observable } from 'rxjs';

/**
 * Types available for configuration
 */
export type ConfigurationValueType = string | number | boolean;

/**
 * Nested configuration allowing one level only
 * Object should only contain primitive types
 */
export interface NestedConfiguration {
  [key: string]: ConfigurationValueType;
}

/**
 * @Deprecated will be removed in v10. Please use Configuration instead
 * Generic configuration
 */
export interface LegacyConfiguration {
  [key: string]: ConfigurationValueType | Partial<LegacyConfiguration> | (ConfigurationValueType | Partial<LegacyConfiguration>)[] | undefined;
}

/**
 * Interface of configuration that is supported by the cms
 */
export interface StrictConfiguration {
  [key: string]: ConfigurationValueType | (string | NestedConfiguration)[];
}

/**
 * Configuration mode
 */
export type ConfigurationMode = 'legacy' | 'strict';

/**
 * Interface of configuration that is supported by the cms
 * NOTE: specify "legacy" as parameter type to disable strict mode and allow values not supported by the CMS. This option is strongly not recommended and deprecated.
 */
export type Configuration<T extends ConfigurationMode = 'strict'> = T extends 'strict' ? StrictConfiguration : LegacyConfiguration;

/** Configuration model exported by the CMS */
export interface CustomConfig<T extends Partial<Configuration> = Partial<Configuration>> {

  /** Component name */
  name: string;

  /** Component's library name; No library name for global config */
  library?: string;

  /** Component configuration as key value pairs */
  config: T;
}

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


/**
 * Description of a configuration property extracted to the CMS
 */
export interface CategoryDescription {
  /** Category name */
  name: string;

  /** Category description */
  label: string;
}

/** Types of components config */
export type ConfigType = 'Block' | 'Page' | 'AppRuntimeConfiguration' | 'AppBuildConfiguration' | 'ExposedComponent';
