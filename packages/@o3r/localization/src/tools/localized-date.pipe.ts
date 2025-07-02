import {
  DatePipe,
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
 * Native angular DatePipe taking the current lang into consideration
 */
@Pipe({
  name: 'date',
  pure: false
})
export class LocalizedDatePipe extends DatePipe implements OnDestroy, PipeTransform {
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
  public transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string
    | null;
  public transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  public transform(
    value: Date | string | number | null | undefined, format?: string, timezone?: string,
    locale?: string): string | null;
  public transform(
    value: Date | string | number | null | undefined, format = 'mediumDate', timezone?: string,
    locale?: string): string | null {
    return this.localizationService.showKeys ? format : super.transform(value, format, timezone, locale || this.localizationService.getCurrentLanguage());
  }

  public ngOnDestroy(): void {
    this.onLangChange.unsubscribe();
  }
}
