import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalizationService } from '../tools';

@Injectable()
export class OtterLocalizationDevtools {
  constructor(private localizationService: LocalizationService) {}

  /**
   * Show localization keys
   *
   * @param value value enforced by the DevTools extension
   */
  public showLocalizationKeys(value?: boolean): void {
    this.localizationService.toggleShowKeys(value);
  }

  /**
   * Returns the current language
   */
  public getCurrentLanguage() {
    return this.localizationService.getCurrentLanguage();
  }

  /**
   * Setup a listener on language change
   * @param fn called when the language is changed in the app
   */
  public onLanguageChange(fn: (language: string) => any): Subscription {
    return this.localizationService
      .getTranslateService()
      .onLangChange
      .subscribe(({ lang }) => {
        fn(lang);
      });
  }
}
