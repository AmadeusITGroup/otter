/* eslint-disable no-console */
import { Inject, Injectable, Optional } from '@angular/core';
import type { DevtoolsServiceInterface, WindowWithDevtools } from '@o3r/core';
import { ApplicationDevtoolsServiceOptions } from './application-devkit.interface';
import { OtterApplicationDevtools } from './application-devtools.service';
import { OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_APPLICATION_DEVTOOLS_OPTIONS } from './application-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDevtoolsConsoleService implements DevtoolsServiceInterface {
  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'application';

  private readonly options: ApplicationDevtoolsServiceOptions;

  constructor(
    private applicationDevtools: OtterApplicationDevtools,
    @Optional() @Inject(OTTER_APPLICATION_DEVTOOLS_OPTIONS) options?: ApplicationDevtoolsServiceOptions
  ) {
    this.options = { ...OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, ...options };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }
  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_ ||= {};
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_[ApplicationDevtoolsConsoleService.windowModuleName] = this;

    console.info(`Otter Application Devtools is now accessible via the _OTTER_DEVTOOLS_.${ApplicationDevtoolsConsoleService.windowModuleName} variable`);
  }

  /** Display the information relative to the running application */
  public displayApplicationInfo() {
    console.info('Application info', this.applicationDevtools.getApplicationInformation());
  }
}
