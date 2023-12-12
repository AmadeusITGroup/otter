import { Injectable } from '@angular/core';
import { LocalizationService } from '../tools';

@Injectable()
export class OtterLocalizationDevtools {

  constructor(private readonly localizationService: LocalizationService) {
  }

  /**
   * Show localization keys
   * @param value value enforced by the DevTools extension
   */
  public showLocalizationKeys(value?: boolean): void {
    this.localizationService.toggleShowKeys(value);
  }
}
