import {
  InjectionToken,
} from '@angular/core';
import type {
  StylingDevtoolsServiceOptions,
} from './styling-devkit.interface';

/**
 * Default value for styling devtools
 */
export const OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS: StylingDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false,
  stylingMetadataPath: './metadata/styling.metadata.json'
};

/**
 * Token for styling devtools
 */
export const OTTER_STYLING_DEVTOOLS_OPTIONS: InjectionToken<StylingDevtoolsServiceOptions> = new InjectionToken<StylingDevtoolsServiceOptions>('Otter Styling Devtools options');
