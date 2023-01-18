import { Configuration } from '../interfaces/configuration';
/**
 * Application config
 * Application config should implement this to be identified by CMS extractor as a 'runtime' config
 */
export interface AppRuntimeConfiguration extends Configuration {}

/**
 * Application config
 * Application config should implement this to be identified by CMS extractor as a 'build time' config
 */
export interface AppBuildConfiguration extends Configuration {}
