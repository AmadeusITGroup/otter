/* eslint-disable no-console */
import { Inject, Injectable, Optional } from '@angular/core';
import type { ContextualizationDataset, DevtoolsServiceInterface, WindowWithDevtools } from '@o3r/core';
import { Subscription } from 'rxjs';
import { LocalizationContextualizationDevtools, LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

@Injectable()
export class LocalizationDevtoolsConsoleService implements DevtoolsServiceInterface, LocalizationContextualizationDevtools {

  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'localization';

  constructor(
    private readonly localizationDevtools: OtterLocalizationDevtools,
    @Optional() @Inject(OTTER_LOCALIZATION_DEVTOOLS_OPTIONS) private readonly options: LocalizationDevtoolsServiceOptions = OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS
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
  public isTranslationDeactivationEnabled(): boolean | Promise<boolean> {
    return this.localizationDevtools.isTranslationDeactivationEnabled();
  }

  /**
   * @inheritdoc
   */
  public showLocalizationKeys(value?: boolean): void | Promise<void> {
    this.localizationDevtools.showLocalizationKeys(value);
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
    await this.localizationDevtools.switchLanguage(language);
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
    return this.localizationDevtools.updateLocalizationKeys(keyValues, language);
  }

  /**
   * @inheritdoc
   */
  public reloadLocalizationKeys(language?: string) {
    return this.localizationDevtools.reloadLocalizationKeys(language);
  }
}
