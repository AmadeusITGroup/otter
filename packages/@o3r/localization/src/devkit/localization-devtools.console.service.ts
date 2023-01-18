/* eslint-disable no-console */
import { Inject, Injectable, Optional } from '@angular/core';
import type { DevtoolsServiceInterface, WindowWithDevtools } from '@o3r/core';
import { LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

@Injectable()
export class LocalizationDevtoolsConsoleService implements DevtoolsServiceInterface {

  constructor(
    private readonly localizationDevtools: OtterLocalizationDevtools,
    @Optional() @Inject(OTTER_LOCALIZATION_DEVTOOLS_OPTIONS) private options: LocalizationDevtoolsServiceOptions = OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS
  ) {
    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_ = {
      // eslint-disable-next-line no-underscore-dangle
      ...windowWithDevtools._OTTER_DEVTOOLS_,
      ...this
    };

    console.info('Otter localization Devtools is now accessible via the _OTTER_DEVTOOLS_ variable');
  }

  /**
   * Show localization keys
   *
   * @param value value enforced by the DevTools extension
   */
  public showLocalizationKeys(value?: boolean): void {
    this.localizationDevtools.showLocalizationKeys(value);
  }
}
