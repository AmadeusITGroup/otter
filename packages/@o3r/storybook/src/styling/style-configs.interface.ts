import {
  StorybookStoryConfiguration,
} from '../types';

/** Style argument name prefix */
export const STYLING_PREFIX = 'cssvar-';

/** Style configuration of Storybook stories */
export interface StyleConfigs extends StorybookStoryConfiguration {
  /** Raw values as defined in metadata */
  rawValues: Record<string, string>;
}
