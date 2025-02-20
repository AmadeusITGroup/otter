import {
  DecimalPipe,
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
 * Native angular DecimalPipe taking the current lang into consideration
 */
@Pipe({
  name: 'decimal',
  pure: false,
  standalone: false
})
export class LocalizedDecimalPipe extends DecimalPipe implements OnDestroy, PipeTransform {
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
  public transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
  public transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
  public transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null {
    return super.transform(value, digitsInfo, locale || this.localizationService.getCurrentLanguage());
  }

  public ngOnDestroy(): void {
    this.onLangChange.unsubscribe();
  }
}
