import { InjectionToken } from '@angular/core';
import { StylingDevtoolsServiceOptions } from './styling-devkit.interface';

export const OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS: StylingDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false,
  stylingMetadataPath: './metadata/styling.metadata.json'
};

export const OTTER_STYLING_DEVTOOLS_OPTIONS: InjectionToken<StylingDevtoolsServiceOptions> = new InjectionToken<StylingDevtoolsServiceOptions>('Otter Styling Devtools options');
