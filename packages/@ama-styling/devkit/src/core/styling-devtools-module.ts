import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import type {
  StylingDevtoolsServiceOptions,
} from './styling-devkit-interface';
import {
  OtterStylingDevtools,
} from './styling-devtools';
import {
  StylingDevtoolsMessageService,
} from './styling-devtools-message-service';
import {
  OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_STYLING_DEVTOOLS_OPTIONS,
} from './styling-devtools-token';

/**
 * @deprecated Will be removed in v16. Use {@link provideStylingDevtools} instead.
 */
@NgModule({
  providers: [
    { provide: OTTER_STYLING_DEVTOOLS_OPTIONS, useValue: OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS },
    StylingDevtoolsMessageService,
    OtterStylingDevtools
  ]
})
export class StylingDevtoolsModule {
  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<StylingDevtoolsServiceOptions>): ModuleWithProviders<StylingDevtoolsModule> {
    return {
      ngModule: StylingDevtoolsModule,
      providers: [
        { provide: OTTER_STYLING_DEVTOOLS_OPTIONS, useValue: { ...OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        StylingDevtoolsMessageService,
        OtterStylingDevtools
      ]
    };
  }
}

/**
 * Provide styling devtools functionality.
 * @param options Optional partial styling devtools configuration to override defaults.
 */
export function provideStylingDevtools(options?: Partial<StylingDevtoolsServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: OTTER_STYLING_DEVTOOLS_OPTIONS, useValue: { ...OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS, ...options } },
    StylingDevtoolsMessageService,
    OtterStylingDevtools
  ]);
}
