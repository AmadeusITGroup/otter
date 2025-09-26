import {
  inject,
  Injectable,
} from '@angular/core';
import {
  lastValueFrom,
  Subscription,
} from 'rxjs';
import {
  LocalizationService,
} from '../tools';

@Injectable()
export class OtterLocalizationDevtools {
  private readonly localizationService = inject(LocalizationService);

  /**
   * Is the translation deactivation enabled
   */
  public isTranslationDeactivationEnabled() {
    return this.localizationService.isTranslationDeactivationEnabled();
  }

  /**
   * Show localization keys
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
      .langChanges$
      .subscribe((lang) => {
        fn(lang);
      });
  }

  /**
   * Switch the current language to the specified value
   * @param language new language to switch to
   */
  public async switchLanguage(language: string | undefined) {
    if (!language) {
      return;
    }
    await lastValueFrom(this.localizationService.useLanguage(language));
  }

  /**
   * Updates the specified localization key/values for the current language.
   *
   * Recommendation: To be used with a small number of keys to update to avoid performance issues.
   * @param keyValues key/values to update
   * @param language if not provided, the current language value
   */
  public updateLocalizationKeys(keyValues: { [key: string]: string }, language?: string): void | Promise<void> {
    const lang = language || this.getCurrentLanguage();
    const translateService = this.localizationService.getTranslateService();
    translateService.setTranslation(keyValues, lang);
  }

  /**
   * Reload a language from the language file
   * @see https://github.com/ngx-translate/core/blob/master/packages/core/lib/translate.service.ts#L490
   * @param language language to reload
   */
  public async reloadLocalizationKeys(language?: string) {
    const lang = language || this.getCurrentLanguage();
    const translateService = this.localizationService.getTranslateService();
    const translations = await lastValueFrom(translateService.load(lang));
    translateService.setTranslation(translations, lang, { merge: false });
  }
}
