import {
  DecimalPipe,
} from '@angular/common';
import {
  ChangeDetectorRef,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  LocalizationService,
} from './localization-service';

/**
 * Native angular DecimalPipe taking the current lang into consideration
 */
@Pipe({
  name: 'number',
  pure: false,
  standalone: true
})
export class LocalizedDecimalPipe extends DecimalPipe implements PipeTransform {
  private readonly localizationService = inject(LocalizationService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super(inject(LocalizationService).getCurrentLanguage());
    this.localizationService.getTranslateService().langChanges$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.changeDetectorRef.markForCheck()
      );
  }

  /**
   * @inheritdoc
   */
  public transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
  public transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
  public transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null {
    return this.localizationService.showKeys() ? '' : super.transform(value, digitsInfo, locale || this.localizationService.getCurrentLanguage());
  }
}
