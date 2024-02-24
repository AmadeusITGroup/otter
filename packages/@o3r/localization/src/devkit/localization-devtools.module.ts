import { ModuleWithProviders, NgModule } from '@angular/core';
import { LocalizationModule } from '../tools/index';
import type { LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';
import { LocalizationDevtoolsConsoleService } from './localization-devtools.console.service';
import { LocalizationDevtoolsMessageService } from './localization-devtools.message.service';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

@NgModule({
  imports: [
    LocalizationModule
  ],
  providers: [
    { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS },
    LocalizationDevtoolsMessageService,
    LocalizationDevtoolsConsoleService,
    OtterLocalizationDevtools
  ]
})
export class LocalizationDevtoolsModule {

  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<LocalizationDevtoolsServiceOptions>): ModuleWithProviders<LocalizationDevtoolsModule> {
    return {
      ngModule: LocalizationDevtoolsModule,
      providers: [
        { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: { ...OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        LocalizationDevtoolsMessageService,
        LocalizationDevtoolsConsoleService,
        OtterLocalizationDevtools
      ]
    };
  }
}
