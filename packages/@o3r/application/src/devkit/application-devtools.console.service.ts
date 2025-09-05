/* eslint-disable no-console -- purpose of the service is to log in the console */
import {
  inject,
  Injectable,
} from '@angular/core';
import type {
  DevtoolsServiceInterface,
  WindowWithDevtools,
} from '@o3r/core';
import {
  ApplicationDevtoolsServiceOptions,
} from './application-devkit.interface';
import {
  OtterApplicationDevtools,
} from './application-devtools.service';
import {
  OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_APPLICATION_DEVTOOLS_OPTIONS,
} from './application-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDevtoolsConsoleService implements DevtoolsServiceInterface {
  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'application';

  private readonly applicationDevtools = inject(OtterApplicationDevtools);
  private readonly options: ApplicationDevtoolsServiceOptions;

  constructor() {
    const options = inject<ApplicationDevtoolsServiceOptions>(OTTER_APPLICATION_DEVTOOLS_OPTIONS, { optional: true });

    this.options = { ...OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, ...options };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;
    windowWithDevtools._OTTER_DEVTOOLS_ ||= {};
    windowWithDevtools._OTTER_DEVTOOLS_[ApplicationDevtoolsConsoleService.windowModuleName] = this;

    console.info(`Otter Application Devtools is now accessible via the _OTTER_DEVTOOLS_.${ApplicationDevtoolsConsoleService.windowModuleName} variable`);
  }

  /** Display the information relative to the running application */
  public displayApplicationInfo() {
    console.info('Application info', this.applicationDevtools.getApplicationInformation());
  }
}
