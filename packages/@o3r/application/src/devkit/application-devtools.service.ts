import {
  DOCUMENT
} from '@angular/common';
import {
  inject,
  Injectable
} from '@angular/core';
import {
  type Dataset,
  isProductionEnvironment
} from '@o3r/core';
import {
  ENVIRONMENT_CONFIG_TOKEN
} from '@o3r/routing';
import type {
  ApplicationInformation
} from './application-devkit.interface';
import {
  OTTER_APPLICATION_DEVTOOLS_OPTIONS
} from './application-devtools.token';

@Injectable({ providedIn: 'root' })
export class OtterApplicationDevtools {
  private readonly options = inject(OTTER_APPLICATION_DEVTOOLS_OPTIONS, { optional: true });
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly env = inject(ENVIRONMENT_CONFIG_TOKEN, { optional: true });

  public getApplicationInformation(): ApplicationInformation {
    return {
      appName: this.options?.appName || 'unknown',
      appVersion: this.env?.APP_VERSION || 'unknown',
      isProduction: isProductionEnvironment(this.document?.body.dataset as Dataset)
    };
  }
}
