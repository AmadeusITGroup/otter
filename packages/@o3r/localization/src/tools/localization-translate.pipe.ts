import { ChangeDetectorRef, Inject, Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LocalizationConfiguration } from '../core';
import { LocalizationService } from './localization.service';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';
/**
 * TranslatePipe class adding debug functionality
 */
@Pipe({name: 'translate', pure: false})
export class LocalizationTranslatePipe extends TranslatePipe implements PipeTransform {
  /**
   * Internal subscription to the LocalizationService showKeys mode changes
   */
  private onShowKeysChange?: Subscription;

  /**
   * Internal subscription to the LocalizationService key mapping
   */
  private onKeyChange?: Subscription;

  /**
   * Should we display keys instead of translations
   */
  private showKeys = false;

  /** last key queried */
  private lastQueryKey?: string;

  /** last key resolved */
  private lastResolvedKey?: string;

  constructor(private localizationService: LocalizationService, translateService: TranslateService, private changeDetector: ChangeDetectorRef,
              @Inject(LOCALIZATION_CONFIGURATION_TOKEN) private localizationConfig: LocalizationConfiguration) {
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
   *
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
  }
}
