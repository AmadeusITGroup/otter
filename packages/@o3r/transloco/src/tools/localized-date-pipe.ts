import {
  DatePipe,
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
 * Native angular DatePipe taking the current lang into consideration
 */
@Pipe({
  name: 'date',
  pure: false,
  standalone: false
})
export class LocalizedDatePipe extends DatePipe implements PipeTransform {
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
  public transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string
    | null;
  public transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  public transform(
    value: Date | string | number | null | undefined, format?: string, timezone?: string,
    locale?: string): string | null;
  public transform(
    value: Date | string | number | null | undefined, format = 'mediumDate', timezone?: string,
    locale?: string): string | null {
    return this.localizationService.showKeys() ? format : super.transform(value, format, timezone, locale || this.localizationService.getCurrentLanguage());
  }
}
