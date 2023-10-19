import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { O3rComponent } from '@o3r/core';
import { Localization, LocalizationModule, LocalizationService, Translatable } from '@o3r/localization';
import { LocalizationPresTranslation, translations } from './localization-pres.translation';
import { Subscription } from 'rxjs';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-localization-pres',
  templateUrl: './localization-pres.template.html',
  styleUrls: ['./localization-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizationModule, CommonModule, ReactiveFormsModule
  ]
})
export class LocalizationPresComponent implements Translatable<LocalizationPresTranslation>, OnDestroy {
  /**
   * Form group
   */
  public form: FormGroup<{ destination: FormControl<string | null>; outboundDate: FormControl<string | null> }>;

  /** Localization of the component*/
  @Input()
  @Localization('./localization-pres.localization.json')
  public translations: LocalizationPresTranslation;

  private subscription = new Subscription();

  constructor(localizationService: LocalizationService, fb: FormBuilder) {
    this.form = fb.group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS))
    });
    this.translations = translations;

    this.subscription.add(
      this.form.controls.destination.valueChanges.subscribe((value) => {
        let language = 'en-GB';
        switch (value) {
          case 'PAR': {
            language = 'fr-FR';
            break;
          }
          case 'NYC': {
            language = 'en-US';
            break;
          }
        }
        localizationService.useLanguage(language);
      })
    );
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
