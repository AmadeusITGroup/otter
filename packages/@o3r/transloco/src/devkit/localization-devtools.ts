import {
  ApplicationRef,
  inject,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  TRANSLOCO_TRANSPILER,
  type TranslocoTranspiler,
} from '@jsverse/transloco';
import {
  lastValueFrom,
  Subscription,
} from 'rxjs';
import {
  LocalizationService,
} from '../tools';

/**
 * Service that provides core localization devtools functionality
 */
@Injectable()
export class OtterLocalizationDevtools implements OnDestroy {
  private readonly localizationService = inject(LocalizationService);
  private readonly translateTranspiler = inject<TranslocoTranspiler>(TRANSLOCO_TRANSPILER);
  private readonly appRef = inject(ApplicationRef);
  private readonly languageChangeSubscriptions = new Set<Subscription>();

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
   * Set up a listener on language change
   * @param fn called when the language is changed in the app
   * @returns Object with unsubscribe() method to prevent memory leaks
   */
  public onLanguageChange(fn: (language: string) => any): { unsubscribe: () => void } {
    const subscription = this.localizationService
      .getTranslateService()
      .langChanges$
      .subscribe((lang: string) => {
        fn(lang);
      });

    this.languageChangeSubscriptions.add(subscription);

    // Return custom object with unsubscribe method
    return {
      unsubscribe: () => {
        subscription.unsubscribe();
        this.languageChangeSubscriptions.delete(subscription);
      }
    };
  }

  /**
   * Clear all language change listeners
   */
  public clearLanguageChangeListeners(): void {
    this.languageChangeSubscriptions.forEach((sub) => sub.unsubscribe());
    this.languageChangeSubscriptions.clear();
  }

  /**
   * Cleanup subscriptions when service is destroyed
   */
  public ngOnDestroy(): void {
    this.clearLanguageChangeListeners();
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
    const translateService = this.localizationService.getTranslateService();
    Object.entries(keyValues).forEach(([key, value]) => {
      translateService.setTranslationKey(key, value, { lang });
    });
    this.appRef.tick();
  }

  /**
   * Reload a language from the language file
   * @param language language to reload
   */
  public async reloadLocalizationKeys(language?: string) {
    const lang = language || this.getCurrentLanguage();
    if ((this.translateTranspiler as any).setLocale) {
      (this.translateTranspiler as any).setLocale(null);
    }
    const translateService = this.localizationService.getTranslateService();
    const translations = await lastValueFrom(translateService.load(lang));
    translateService.setTranslation(translations, lang, { merge: false });
    this.appRef.tick();
  }
}
