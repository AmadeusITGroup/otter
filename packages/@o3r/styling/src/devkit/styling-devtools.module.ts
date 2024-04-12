import { ModuleWithProviders, NgModule } from '@angular/core';
import type { StylingDevtoolsServiceOptions } from './styling-devkit.interface';
import { StylingDevtoolsMessageService } from './styling-devtools.message.service';
import { OtterStylingDevtools } from './styling-devtools.service';
import { OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS, OTTER_STYLING_DEVTOOLS_OPTIONS } from './styling-devtools.token';

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
