import {
  ChangeDetectorRef,
  Inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import {
  Subscription,
} from 'rxjs';
import {
  LocalizationConfiguration,
} from '../core';
import {
  LocalizationService,
} from './localization.service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
} from './localization.token';

/**
 * TranslatePipe class adding debug functionality
 */
@Pipe({
  name: 'o3rTranslate',
  pure: false,
  standalone: false
})
export class O3rLocalizationTranslatePipe extends TranslatePipe implements PipeTransform, OnDestroy {
  /**
   * Internal subscription to the LocalizationService showKeys mode changes
   */
  protected readonly onShowKeysChange?: Subscription;

  /**
   * Internal subscription to the LocalizationService key mapping
   */
  protected onKeyChange?: Subscription;

  /**
   * Should we display keys instead of translations
   */
  protected showKeys = false;

  /** last key queried */
  protected lastQueryKey?: string;

  /** last key resolved */
  protected lastResolvedKey?: string;

  constructor(protected readonly localizationService: LocalizationService, translateService: TranslateService, protected readonly changeDetector: ChangeDetectorRef,
    @Inject(LOCALIZATION_CONFIGURATION_TOKEN) protected readonly localizationConfig: LocalizationConfiguration) {
    super(translateService, changeDetector);

    if (localizationConfig.enableTranslationDeactivation) {
      this.onShowKeysChange = this.localizationService.showKeys$.subscribe((showKeys) => {
        this.showKeys = showKeys;
        this.changeDetector.markForCheck();
      });
    }
  }

  /**
   * Calls original transform method and eventually outputs the key if debugMode (in LocalizationConfiguration) is enabled
   * @inheritdoc
   */
  public transform(query: string, ...args: any[]): any {
    if (this.showKeys) {
      return query;
    }

    if (query !== this.lastQueryKey) {
      this.lastQueryKey = query;
      if (this.onKeyChange) {
        this.onKeyChange.unsubscribe();
      }
      this.onKeyChange = this.localizationService.getKey(query).subscribe((key) => {
        this.lastResolvedKey = key;
        this.changeDetector.markForCheck();
      });
    }

    if (this.lastResolvedKey) {
      const value = super.transform(this.lastResolvedKey, ...args);

      if (this.localizationConfig.debugMode) {
        return `${this.lastResolvedKey} - ${value as string}`;
      }

      return value;
    }

    return this.value;
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    if (this.onShowKeysChange) {
      this.onShowKeysChange.unsubscribe();
    }
    if (this.onKeyChange) {
      this.onKeyChange.unsubscribe();
    }
  }
}
