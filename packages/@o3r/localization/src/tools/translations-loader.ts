import {
  Inject,
  Injectable,
  Optional
} from '@angular/core';
import {
  TranslateLoader
} from '@ngx-translate/core';
import {
  DynamicContentService
} from '@o3r/dynamic-content';
import {
  LoggerService
} from '@o3r/logger';
import {
  combineLatest,
  from,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  map,
  switchMap
} from 'rxjs/operators';
import {
  LocalizationConfiguration
} from '../core';
import {
  LOCALIZATION_CONFIGURATION_TOKEN
} from './localization.token';

const JSON_EXT = '.json';

/**
 * This class is responsible for loading translation bundles from remote or local endpoints depending on the LocalizationConfiguration.
 * Fallback mechanism ensures that if a bundle in some language cannot be fetched remotely
 * we try to fetch the same language bundle locally (bundles stored inside the application)
 * and finally load the fallback language bundle (if all previous fetches failed)
 */
@Injectable()
export class TranslationsLoader implements TranslateLoader {
  constructor(@Inject(LOCALIZATION_CONFIGURATION_TOKEN) private readonly localizationConfiguration: LocalizationConfiguration,
    @Optional() private readonly logger?: LoggerService,
    @Optional() private readonly dynamicContentService?: DynamicContentService) {}

  /**
   * Download a language bundle file
   * @param  url Url to the bundle file
   */
  private downloadLanguageBundle$(url: string) {
    const queryParams = this.localizationConfiguration.queryParams;

    let queryString = '';
    if (queryParams) {
      queryString = '?' + Object.keys(queryParams).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])).join('&');
    }
    return from(fetch(url + queryString, this.localizationConfiguration.fetchOptions)).pipe(
      switchMap((response) => from(response.json()))
    );
  }

  /**
   * @inheritdoc
   */
  public getTranslation(lang: string): Observable<any> {
    const fallback = this.localizationConfiguration.fallbackLanguage;
    let localizationPath$ = of(this.localizationConfiguration.endPointUrl);

    if (this.localizationConfiguration.useDynamicContent) {
      if (!this.dynamicContentService) {
        throw new Error('Dynamic Content is not available. Please verify you have imported the module DynamicContentModule in your application');
      }
      localizationPath$ = this.dynamicContentService.getContentPathStream(this.localizationConfiguration.endPointUrl);
    }

    return localizationPath$.pipe(
      switchMap((localizationPath: string) => {
        if (localizationPath) {
          const localizationBundle$ = this.downloadLanguageBundle$(localizationPath + lang + JSON_EXT);

          if (this.localizationConfiguration.mergeWithLocalTranslations) {
            return combineLatest([
              localizationBundle$.pipe(catchError(() => of({}))),
              this.getTranslationFromLocal(lang, fallback).pipe(
                map((translations) => {
                  Object.keys(translations).forEach((key) => translations[key] = `[local] ${translations[key] as string}`);
                  return translations;
                })
              )
            ]).pipe(map(([dynamicTranslations, localTranslations]) => ({ ...localTranslations, ...dynamicTranslations })));
          }

          /*
          * if endPointUrl is specified by the configuration then:
          *   1. try to load lang from endPointUrl
          *   2. if 1 fails then try to load from the app (local file)
          */
          return localizationBundle$.pipe(
            catchError(() => {
              this.logger?.warn(`Failed to load the localization resource from ${localizationPath + lang + JSON_EXT}, trying from the application resources`);
              return this.getTranslationFromLocal(lang, fallback);
            })
          );
        }
        /*
        * else if endPointUrl NOT specified by then configuration then:
        *   1. try to load from the app (local file)
        */
        this.logger?.warn('No localization endpoint specified, localization fetch from application resources');
        return this.getTranslationFromLocal(lang, fallback);
      })
    );
  }

  /**
   *
   *Fetches localization bundles from published folder (internal to application)
   *
   *1. try to load lang from local
   *2. if 1 fails try to load fallback lang but only if it's different from lang in 1
   * @param lang - language of the bundle
   * @param fallbackLanguage - fallback language in case bundle in language not found
   */
  public getTranslationFromLocal(lang: string, fallbackLanguage: string): Observable<any> {
    const pathPrefix: string = this.localizationConfiguration.bundlesOutputPath;
    return this.downloadLanguageBundle$(pathPrefix + lang + JSON_EXT).pipe(
      catchError(() => {
        if (lang === fallbackLanguage) {
          this.logger?.warn(`Failed to load ${lang} from ${pathPrefix + lang + JSON_EXT}.`);
          return of({});
        } else {
          this.logger?.warn(`Failed to load ${lang} from ${pathPrefix + lang + JSON_EXT}. Application will fallback to ${fallbackLanguage}`);
          return this.downloadLanguageBundle$(pathPrefix + fallbackLanguage + JSON_EXT).pipe(
            catchError(() => of({}))
          );
        }
      })
    );
  }
}
