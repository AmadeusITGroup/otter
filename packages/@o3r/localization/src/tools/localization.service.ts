import { Inject, Injectable, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@o3r/logger';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { LocalizationConfiguration } from '../core/localization.configuration';
import { LocalizationOverrideStore, selectLocalizationOverride } from '../stores/index';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';

/**
 * Service which is wrapping the configuration logic of TranslateService from ngx-translate
 * Any application willing to use localization just needs to inject LocalizationService
 * in the root component and call its configure() method.
 */
@Injectable()
export class LocalizationService {

  private readonly localeSplitIdentifier: string = '-';

  /**
   * Internal subject that we use to track changes between keys only and translation mode
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly _showKeys$ = new BehaviorSubject(false);

  /**
   * Map of localization keys to replace a key to another
   */
  private readonly keyMapping$?: Observable<Record<string, any>>;

  /**
   * _showKeys$ exposed as an Observable
   */
  public showKeys$ = this._showKeys$.asObservable();

  constructor(
    private readonly translateService: TranslateService,
    private readonly logger: LoggerService,
    @Inject(LOCALIZATION_CONFIGURATION_TOKEN) private readonly configuration: LocalizationConfiguration,
    @Optional() private readonly store?: Store<LocalizationOverrideStore>
  ) {
    this.configure();
    if (this.store) {
      this.keyMapping$ = this.store.pipe(
        select(selectLocalizationOverride)
      );
    }
  }

  /**
   * This will handle the fallback language hierarchy to find out fallback language.
   * supportedLocales language has highest priority, next priority goes to fallbackLocalesMap and default would be
   * fallbackLanguage.
   * @param language Selected language.
   * @returns selected language if supported, fallback language otherwise.
   */
  private checkFallbackLocalesMap<T extends string | undefined>(language: T) {
    if (language && this.configuration.supportedLocales.indexOf(language) === -1) {
      const closestSupportedLanguageCode = this.getFirstClosestSupportedLanguageCode(language);
      const fallbackForLanguage = this.getFallbackMapLangCode(language);
      const fallbackStrategyDebug = fallbackForLanguage && ' associated fallback language ' ||
        closestSupportedLanguageCode && ' closest supported language ' ||
        this.configuration.fallbackLanguage && ' configured default language ';
      const fallbackLang = fallbackForLanguage || closestSupportedLanguageCode || this.configuration.fallbackLanguage || language;
      if (language !== fallbackLang) {
        this.logger.debug(`Non supported languages ${language} will fallback to ${fallbackStrategyDebug} ${fallbackLang}`);
      }
      return fallbackLang;
    } else if (!language) {
      this.logger.debug('Language is not defined');
    }
    return language;
  }

  /**
   * This function checks if fallback language can be provided from fallbackLocalesMap.
   * supportedLocales: ['en-GB', 'en-US', 'fr-FR'], fallbackLocalesMap: {'en-CA': 'en-US', 'de': 'fr-FR'}
   * translate to en-CA -> fallback to en-US, translate to de-DE -> fallback to fr-FR
   * translate to en-NZ -> fallback to en-GB
   * @param language Selected language.
   * @returns Fallback language if available, undefined otherwise.
   */
  private getFallbackMapLangCode(language: string): string | undefined {
    const fallbackLocalesMap = this.configuration.fallbackLocalesMap;
    const [locale] = language.split(this.localeSplitIdentifier);

    return fallbackLocalesMap && (fallbackLocalesMap[language] || fallbackLocalesMap[locale]);

  }

  /**
   * This function checks if closest supported language available incase of selected language is not
   * supported language.
   * supportedLocales: ['en-GB', 'en-US', 'fr-FR']
   * translate to en-CA -> fallback to en-GB
   * @param language Selected language.
   * @returns Closest supported language if available, undefined otherwise.
   */
  private getFirstClosestSupportedLanguageCode(language: string): string | undefined {

    const [locale] = language.split(this.localeSplitIdentifier);
    const firstClosestRegx = new RegExp(`^${locale}${this.localeSplitIdentifier}?`, 'i');

    return this.configuration.supportedLocales.find((supportedLang) => firstClosestRegx.test(supportedLang));
  }

  /**
   * Returns a stream of translated values of a key which updates whenever the language changes.
   * @param translationKey Key to translate
   * @param interpolateParams Object to use in translation binding
   * @returns A stream of the translated key
   */
  private getTranslationStream(translationKey: string, interpolateParams?: object) {
    const translation$ = this.translateService.stream(translationKey, interpolateParams).pipe(
      map((value: string) => this.configuration.debugMode ? `${translationKey} - ${value}` : value)
    );

    if (!this.configuration.enableTranslationDeactivation) {
      return translation$;
    }

    return combineLatest([
      translation$,
      this.showKeys$
    ]).pipe(
      map(([value, showKeys]) => showKeys ? translationKey : value)
    );
  }

  /**
   * Configures TranslateService and registers locales. This method is called from the application level.
   */
  public configure() {
    const language = this.checkFallbackLocalesMap(this.configuration.language || this.configuration.fallbackLanguage);
    this.translateService.addLangs(this.configuration.supportedLocales);
    this.translateService.setDefaultLang(language);
    this.useLanguage(language);
  }

  /**
   * Is the translation deactivation enabled
   */
  public isTranslationDeactivationEnabled() {
    return this.configuration.enableTranslationDeactivation;
  }

  /**
   * Wrapper to call the ngx-translate service TranslateService method getLangs().
   */
  public getLanguages() {
    return this.translateService.getLangs();
  }

  /**
   * Wrapper to call the ngx-translate service TranslateService method use(language).
   * @param language
   */
  public useLanguage(language: string): Observable<any> {

    language = this.checkFallbackLocalesMap(language);
    return this.translateService.use(language);
  }

  /**
   * Wrapper to get the ngx-translate service TranslateService currentLang.
   */
  public getCurrentLanguage() {
    return this.translateService.currentLang;
  }

  /**
   * Get the instance of the ngx-translate TranslateService used by LocalizationService.
   */
  public getTranslateService() {
    return this.translateService;
  }

  /**
   * Toggle the ShowKeys mode between active and inactive.
   * @param value if specified, set the ShowKeys mode to value. If not specified, toggle the ShowKeys mode.
   */
  public toggleShowKeys(value?: boolean) {
    if (!this.configuration.enableTranslationDeactivation) {
      throw new Error('Translation deactivation is not enabled. Please set the LocalizationConfiguration property "enableTranslationDeactivation" accordingly.');
    }
    const newValue = value !== undefined ? value : !this.showKeys;
    this._showKeys$.next(newValue);
  }

  /**
   * Return the current value of debug show/hide translation keys.
   */
  public get showKeys() {
    return this._showKeys$.value;
  }

  /**
   * Get an observable of translation key after global mapping
   * @param requestedKey Original translation key
   */
  public getKey(requestedKey: string) {
    if (this.keyMapping$) {
      return this.keyMapping$.pipe(
        map((keyMapping) => keyMapping && keyMapping[requestedKey] || requestedKey),
        distinctUntilChanged()
      );
    } else {
      return of(requestedKey);
    }
  }

  /**
   * Returns a stream of translated values of a key which updates whenever the language changes.
   * @param key Key to translate
   * @param interpolateParams Object to use in translation binding
   * @returns A stream of the translated key
   */
  public translate(key: string, interpolateParams?: object) {
    return this.getKey(key).pipe(
      switchMap((translationKey) => this.getTranslationStream(translationKey, interpolateParams)),
      shareReplay(1)
    );
  }
}
