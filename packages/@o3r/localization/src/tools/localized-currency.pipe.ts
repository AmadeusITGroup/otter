import {
  CurrencyPipe,
} from '@angular/common';
import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  Subscription,
} from 'rxjs';
import {
  LocalizationService,
} from './localization.service';

/**
 * Native angular CurrencyPipe taking the current lang into consideration
 */
@Pipe({
  name: 'currency',
  pure: false
})
export class LocalizedCurrencyPipe extends CurrencyPipe implements OnDestroy, PipeTransform {
  private readonly onLangChange: Subscription;

  constructor(private readonly localizationService: LocalizationService, private readonly changeDetectorRef: ChangeDetectorRef) {
    super(localizationService.getCurrentLanguage());
    this.onLangChange = this.localizationService.getTranslateService().onLangChange.subscribe(() =>
      this.changeDetectorRef.markForCheck()
    );
  }

  /**
   * @inheritdoc
   */
  public transform(value: number | string, currencyCode?: string, display?: string | boolean, digitsInfo?: string, locale?: string): string | null;
  public transform(value: null | undefined, currencyCode?: string, display?: string | boolean, digitsInfo?: string, locale?: string): null;
  public transform(
    // eslint-disable-next-line @typescript-eslint/unified-signatures -- Expose same signatures as angular CurrencyPipe
    value: number | string | null | undefined, currencyCode?: string, display?: string | boolean, digitsInfo?: string, locale?: string): string | null;
  public transform(
    value: number | string | null | undefined, currencyCode?: string, display?: string | boolean, digitsInfo?: string, locale?: string): string | null {
    return super.transform(value, currencyCode, display, digitsInfo, locale || this.localizationService.getCurrentLanguage());
  }

  public ngOnDestroy(): void {
    this.onLangChange.unsubscribe();
  }
}
