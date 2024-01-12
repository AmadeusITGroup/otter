import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { BuildTimeProperties, isProductionEnvironment } from '@o3r/core';
import { ENVIRONMENT_CONFIG_TOKEN } from '@o3r/routing';
import { ApplicationInformation } from './application-devkit.interface';

@Injectable({ providedIn: 'root' })
export class OtterApplicationDevtools {

  constructor(
    @Optional() @Inject(DOCUMENT) private readonly document?: any,
    @Optional() @Inject(ENVIRONMENT_CONFIG_TOKEN) private readonly env?: BuildTimeProperties) {
  }


  public getApplicationInformation(): ApplicationInformation {
    return {
      appVersion: this.env?.APP_VERSION || 'unknown',
      isProduction: isProductionEnvironment(this.document?.body.dataset)
    };
  }
}
