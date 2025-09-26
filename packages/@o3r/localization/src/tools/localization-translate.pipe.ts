import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  TranslatePipe,
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
  /** Localization service instance */
  protected readonly localizationService = inject(LocalizationService);
  /** Change detector service instance */
  protected readonly changeDetector = inject(ChangeDetectorRef);
  /** Localization config token */
  protected readonly localizationConfig: LocalizationConfiguration = inject(LOCALIZATION_CONFIGURATION_TOKEN);
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

  constructor() {
    super();
    if (this.localizationConfig.enableTranslationDeactivation) {
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
    const value = super.transform(this.lastResolvedKey || query, ...args);

    if (this.localizationConfig.debugMode) {
      return `${this.lastResolvedKey} - ${value as string}`;
    }

    return value;
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
