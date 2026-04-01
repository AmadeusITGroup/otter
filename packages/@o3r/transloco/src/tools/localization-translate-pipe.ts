import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  TRANSLOCO_LANG,
  TRANSLOCO_SCOPE,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import {
  Subscription,
} from 'rxjs';
import {
  LocalizationConfiguration,
} from '../core';
import {
  getDebugKey,
} from './localization-helpers';
import {
  LocalizationService,
} from './localization-service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
} from './localization-token';

/**
 * TranslocoPipe class adding debug functionality
 */
@Pipe({
  name: 'o3rTranslate',
  pure: false,
  standalone: false
})
export class O3rLocalizationTranslatePipe extends TranslocoPipe implements PipeTransform {
  /** Localization service instance */
  protected readonly localizationService = inject(LocalizationService);
  /** Change detector service instance */
  protected readonly changeDetector = inject(ChangeDetectorRef);
  /** Localization config token */
  protected readonly localizationConfig: LocalizationConfiguration = inject(LOCALIZATION_CONFIGURATION_TOKEN);
  /** Destroy reference */
  protected readonly destroyRef = inject(DestroyRef);

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
    super(
      inject(TranslocoService),
      inject(TRANSLOCO_SCOPE, { optional: true }) ?? undefined,
      inject(TRANSLOCO_LANG, { optional: true }) ?? undefined,
      inject(ChangeDetectorRef)
    );
    if (this.localizationConfig.enableTranslationDeactivation) {
      this.localizationService.showKeys$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((showKeys) => {
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
    if (!query || this.localizationService.showKeys()) {
      return query;
    }

    if (query !== this.lastQueryKey) {
      this.lastQueryKey = query;
      if (this.onKeyChange) {
        this.onKeyChange.unsubscribe();
      }
      this.onKeyChange = this.localizationService.getKey(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((key) => {
          this.lastResolvedKey = key;
          this.changeDetector.markForCheck();
        });
    }

    const value = super.transform(this.lastResolvedKey, ...args);

    if (this.localizationConfig.debugMode) {
      return getDebugKey(this.lastResolvedKey!, value);
    }

    return value;
  }
}
