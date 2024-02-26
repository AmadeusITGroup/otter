/* eslint-disable no-console */
import { ApplicationRef, Inject, Injectable, Optional } from '@angular/core';
import type { ContextualizationDataset, DevtoolsServiceInterface, WindowWithDevtools } from '@o3r/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { LocalizationService } from '../tools';
import { LocalizationContextualizationDevtools, LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

@Injectable()
export class LocalizationDevtoolsConsoleService implements DevtoolsServiceInterface, LocalizationContextualizationDevtools {

  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'localization';

  constructor(
    private readonly localizationDevtools: OtterLocalizationDevtools,
    private readonly localizationService: LocalizationService,
    private readonly appRef: ApplicationRef,
    @Optional() @Inject(OTTER_LOCALIZATION_DEVTOOLS_OPTIONS) private options: LocalizationDevtoolsServiceOptions = OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS
  ) {
    if (
      this.options.isActivatedOnBootstrap
      || (
        this.options.isActivatedOnBootstrapWhenCMSContext
        && (document.body.dataset as ContextualizationDataset).cmscontext === 'true'
      )
    ) {
      this.activate();
    }
  }

  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_ ||= {};
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_[LocalizationDevtoolsConsoleService.windowModuleName] = this;

    console.info(`Otter localization Devtools is now accessible via the _OTTER_DEVTOOLS_.${LocalizationDevtoolsConsoleService.windowModuleName} variable`);
  }

  /**
   * @inheritdoc
   */
  public showLocalizationKeys(value?: boolean): void | Promise<void> {
    this.localizationDevtools.showLocalizationKeys(value);
    this.appRef.tick();
  }

  /**
   * @inheritdoc
   */
  public getCurrentLanguage(): string | Promise<string> {
    const currentLanguage = this.localizationDevtools.getCurrentLanguage();
    return currentLanguage;
  }

  /**
   * @inheritdoc
   */
  public async switchLanguage(language: string): Promise<{ previous: string; requested: string; current: string }> {
    const previous = this.localizationDevtools.getCurrentLanguage();
    await lastValueFrom(this.localizationService.useLanguage(language));
    this.appRef.tick();
    const current = this.localizationDevtools.getCurrentLanguage();
    return {
      requested: language,
      previous,
      current
    };
  }

  /**
   * @inheritdoc
   */
  public onLanguageChange(fn: (language: string) => any): Subscription {
    return this.localizationDevtools.onLanguageChange(fn);
  }

  /**
   * @inheritdoc
   */
  public updateLocalizationKeys(keyValues: { [key: string]: string }, language?: string): void | Promise<void> {
    this.localizationService.getTranslateService().setTranslation(
      language || this.localizationDevtools.getCurrentLanguage(),
      keyValues,
      true
    );
  }

  /**
   * @inheritdoc
   */
  public async reloadLocalizationKeys(language?: string) {
    const lang = language || this.localizationDevtools.getCurrentLanguage();
    const initialLocs = await lastValueFrom(
      this.localizationService
        .getTranslateService()
        .reloadLang(lang)
        .pipe(take(1))
    );
    return this.updateLocalizationKeys(initialLocs, lang);
  }
}
