import {
  ApplicationRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  type InterpolatableTranslationObject,
  TranslateCompiler,
  TranslateStore,
} from '@ngx-translate/core';
import {
  lastValueFrom,
  Subscription,
} from 'rxjs';
import type {
  TranslateMessageFormatLazyCompiler,
} from '../core';
import {
  LocalizationService,
} from '../tools';

@Injectable()
export class OtterLocalizationDevtools {
  private readonly localizationService = inject(LocalizationService);
  private readonly translateCompiler = inject(TranslateCompiler);
  private readonly translateStore = inject(TranslateStore);
  private readonly appRef = inject(ApplicationRef);

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
    this.appRef.tick();
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

  /**
   * Switch the current language to the specified value
   * @param language new language to switch to
   */
  public async switchLanguage(language: string | undefined) {
    if (!language) {
      return;
    }
    await lastValueFrom(this.localizationService.useLanguage(language));
    this.appRef.tick();
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
    this.translateStore.setTranslations(lang, Object.entries(keyValues).reduce((acc: InterpolatableTranslationObject, [key, value]) => {
      acc[key] = this.translateCompiler.compile(value, lang);
      return acc;
    }, {}), true);
    this.appRef.tick();
  }

  /**
   * Reload a language from the language file
   * @see https://github.com/ngx-translate/core/blob/master/packages/core/lib/translate.service.ts#L490
   * @param language language to reload
   */
  public async reloadLocalizationKeys(language?: string) {
    const lang = language || this.getCurrentLanguage();
    if ((this.translateCompiler as TranslateMessageFormatLazyCompiler).clearCache) {
      (this.translateCompiler as TranslateMessageFormatLazyCompiler).clearCache();
    }
    const translateService = this.localizationService.getTranslateService();
    await lastValueFrom(translateService.reloadLang(lang));
    this.appRef.tick();
  }
}
